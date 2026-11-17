#!/usr/bin/env python3
"""Idempotent Accurate -> Odoo supplier importer (res.partner).

Consumes the JSONL plan from ``scripts/plan_suppliers.py``, reconciles the
partner-category tree, then upserts partners. Legacy partners are keyed on
their ``FMR-*`` ref; once ``normalize_supplier_refs.py`` has run, the
``scripts/output/supplier_ref_map.json`` artifact is consulted so re-imports
still resolve the same partner under its normalized ``SUP-*`` ref. Newly
created vendors are assigned a plan-compliant ``SUP-[KATEGORI]-[NO_URUT]``
ref directly.
Dry-run by default: pass ``--apply`` to write. Prints aggregate counts only.

Usage:
    python3 scripts/import_suppliers.py --plan /tmp/plan.jsonl
    python3 scripts/import_suppliers.py --plan /tmp/plan.jsonl --apply
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from pathlib import Path
from typing import Any

ENV_PATH = Path(__file__).resolve().parent.parent / ".env.local"
DEFAULT_PLAN = Path("/tmp/repo-plan.jsonl")
DEFAULT_COMPANY = "PT SYAILENDRA BUMI INVESTAMA"

# Rows that exist in the Accurate export but are not real vendors.
EXCLUDED_NAMES = {
    "PAJAK",
    "PPN",
    "SETTING PEMBELI",
    "SUPPLIER UMUM",
    "GIVEAWAY IAA",
}

# Category root per plan category prefix, longest prefix first.
ROOTS: list[tuple[str, str]] = [
    ("03.", "03. Sampel & Bahan Kimia Laboratorium"),
    ("04.", "02. Kemasan, Botol & Label"),
    ("05.", "02. Kemasan, Botol & Label"),
    ("06.", "04. Perlengkapan & Perantara Ekspor"),
    ("07.", "03. Sampel & Bahan Kimia Laboratorium"),
    ("1.", "01. Bahan Baku & Minyak Atsiri"),
    ("2.", "04. Perlengkapan & Perantara Ekspor"),
]

# Child partner-category prefix -> SUP ref segment (plan codification
# SUP-[KATEGORI]-[NO_URUT]). Mirrors normalize_supplier_refs.py.
PREFIX_RULES: list[tuple[str, str]] = [
    ("1.1", "RAW"),
    ("1.2", "EO"),
    ("1.3", "RAW"),
    ("1.4", "COP"),
    ("1.5", "RAW"),
    ("1.6", "RAW"),
    ("2.1", "EXP"),
    ("2.2", "EXP"),
    ("03.", "SAMP"),
    ("04.", "PKG"),
    ("05.", "PKG"),
    ("06.", "GEN"),
    ("07.", "CHEM"),
]
DEFAULT_PREFIX = "GEN"
REF_MAP_PATH = Path(__file__).resolve().parent / "output" / "supplier_ref_map.json"


def sup_segment_for(category: str) -> str:
    for code, segment in PREFIX_RULES:
        if category.startswith(code):
            return segment
    return DEFAULT_PREFIX


def load_ref_map() -> dict[str, str]:
    """Legacy FMR-* -> normalized SUP-* table produced by normalize_supplier_refs.py."""
    if not REF_MAP_PATH.is_file():
        return {}
    data = json.loads(REF_MAP_PATH.read_text(encoding="utf-8"))
    return {
        entry["old_ref"]: entry["new_ref"]
        for entry in data.get("mappings", [])
        if entry.get("old_ref")
    }


def allocate_sup_ref(client: Odoo, segment: str) -> str:
    """Return the next free plan-compliant ref for the given category segment."""
    taken = {
        row["ref"]
        for row in client.kw(
            "res.partner", "search_read", [[["ref", "=like", f"SUP-{segment}-%"]]], {"fields": ["ref"]}
        )
        if row.get("ref")
    }
    number = 1
    while f"SUP-{segment}-{number:03d}" in taken:
        number += 1
    return f"SUP-{segment}-{number:03d}"


def read_env(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise SystemExit(f"missing env file: {path}")
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def root_for(category: str) -> str:
    for prefix, root in ROOTS:
        if category.startswith(prefix):
            return root
    raise ValueError(f"unmapped category: {category}")


class Odoo:
    """Minimal JSON-RPC client (stdlib only)."""

    def __init__(self, base: str, db: str, user: str, secret: str) -> None:
        self.base = base.rstrip("/")
        self.db = db
        self.user = user
        self.secret = secret
        self.uid: int | None = None
        self._id = 1

    def _call(self, service: str, method: str, args: list[Any]) -> Any:
        body = json.dumps(
            {
                "jsonrpc": "2.0",
                "method": "call",
                "params": {"service": service, "method": method, "args": args},
                "id": self._id,
            }
        ).encode()
        self._id += 1
        req = urllib.request.Request(
            f"{self.base}/jsonrpc", data=body, headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
        if "error" in data:
            raise RuntimeError(data["error"].get("data", {}).get("message", "rpc_error"))
        return data["result"]

    def login(self) -> None:
        self.uid = self._call("common", "authenticate", [self.db, self.user, self.secret, {}])
        if not self.uid:
            raise SystemExit("odoo authentication failed")

    def kw(self, model: str, method: str, args: list[Any], kwargs: dict | None = None) -> Any:
        return self._call(
            "object", "execute_kw", [self.db, self.uid, self.secret, model, method, args, kwargs or {}]
        )


def ensure_category(client: Odoo, name: str, parent_id: int | None) -> tuple[int, bool]:
    domain: list[Any] = [["name", "=", name]]
    domain.append(["parent_id", "=", parent_id] if parent_id else ["parent_id", "=", False])
    found = client.kw("res.partner.category", "search", [domain], {"limit": 1})
    if found:
        return found[0], False
    values: dict[str, Any] = {"name": name}
    if parent_id:
        values["parent_id"] = parent_id
    return client.kw("res.partner.category", "create", [values]), True


def ensure_category_map(client: Odoo, categories: list[str]) -> tuple[dict[str, int], int]:
    mapping: dict[str, int] = {}
    created = 0
    roots: dict[str, int] = {}
    for category in categories:
        root_name = root_for(category)
        if root_name not in roots:
            roots[root_name], is_new = ensure_category(client, root_name, None)
            created += int(is_new)
        mapping[category], is_new = ensure_category(client, category, roots[root_name])
        created += int(is_new)
    return mapping, created


def fill_only_empty(existing: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    """Never clobber values already maintained by humans in Odoo."""
    return {
        key: value
        for key, value in payload.items()
        if key != "ref" and value not in (None, "", False) and not existing.get(key)
    }


def apply_plan(
    client: Odoo,
    records: list[dict[str, Any]],
    company_id: int,
    apply: bool,
    ref_map: dict[str, str] | None = None,
) -> dict[str, int]:
    stats = {
        "created": 0,
        "updated": 0,
        "unchanged": 0,
        "excluded": 0,
        "conflicts": 0,
        "categories_created": 0,
    }
    kept = []
    for record in records:
        if record["name"].strip().upper() in EXCLUDED_NAMES:
            stats["excluded"] += 1
            continue
        kept.append(record)

    category_ids, stats["categories_created"] = (
        ensure_category_map(client, sorted({r["planned_category"] for r in kept}))
        if apply
        else ({}, 0)
    )

    for record in kept:
        payload = dict(record["payload"])
        domain = [["ref", "=", record["legacy_code"]]]
        found = client.kw("res.partner", "search", [domain], {"limit": 1})
        if not found and ref_map:
            mapped_ref = ref_map.get(record["legacy_code"])
            if mapped_ref:
                found = client.kw(
                    "res.partner", "search", [["ref", "=", mapped_ref]], {"limit": 1}
                )
        if not apply:
            stats["updated" if found else "created"] += 1
            continue
        if found:
            existing = client.kw(
                "res.partner",
                "read",
                [found, list(payload) + ["category_id", "company_id", "supplier_rank"]],
            )[0]
            # Ref namespace collision: an internal record (no vendor flag, no
            # company) already owns this ref. Never rewrite it silently.
            if not existing.get("supplier_rank") and not existing.get("company_id"):
                stats["conflicts"] += 1
                continue
            changes = fill_only_empty(existing, payload)
            if not existing.get("company_id"):
                changes["company_id"] = company_id
            wanted = category_ids[record["planned_category"]]
            if wanted not in existing["category_id"]:
                changes["category_id"] = [(4, wanted)]
            if changes:
                client.kw("res.partner", "write", [found, changes])
                stats["updated"] += 1
            else:
                stats["unchanged"] += 1
            continue
        payload["company_id"] = company_id
        payload["ref"] = allocate_sup_ref(client, sup_segment_for(record["planned_category"]))
        payload["category_id"] = [(6, 0, [category_ids[record["planned_category"]]])]
        payload["comment"] = payload.get("comment", "")
        client.kw("res.partner", "create", [payload])
        stats["created"] += 1
    return stats


def resolve_company(client: Odoo, name: str) -> int:
    found = client.kw("res.company", "search", [[["name", "ilike", name]]], {"limit": 1})
    if not found:
        raise SystemExit(f"company not found: {name}")
    return found[0]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", type=Path, default=DEFAULT_PLAN)
    parser.add_argument("--company", default=DEFAULT_COMPANY)
    parser.add_argument("--apply", action="store_true", help="actually write to Odoo")
    args = parser.parse_args()

    records = [json.loads(line) for line in args.plan.read_text(encoding="utf-8").splitlines() if line.strip()]
    env = read_env(ENV_PATH)
    secret = env.get("ODOO_API_KEY") or env.get("ODOO_PASSWORD", "")
    if not secret:
        raise SystemExit("ODOO_API_KEY / ODOO_PASSWORD missing in .env.local")

    client = Odoo(env["ODOO_BASE_URL"], env["ODOO_DB"], env["ODOO_USERNAME"], secret)
    client.login()
    company_id = resolve_company(client, args.company)
    stats = apply_plan(client, records, company_id, args.apply, load_ref_map())

    legacy_refs = client.kw(
        "res.partner", "search_count", [[[ "ref", "=like", "FMR-%"], ["supplier_rank", ">", 0]]]
    )
    plan_refs = client.kw(
        "res.partner", "search_count", [[[ "ref", "=like", "SUP-%"], ["supplier_rank", ">", 0]]]
    )
    print(json.dumps({"mode": "apply" if args.apply else "dry-run", "company_id": company_id,
                      "plan_rows": len(records), "suppliers_with_legacy_ref": legacy_refs,
                      "suppliers_with_plan_ref": plan_refs, **stats}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
