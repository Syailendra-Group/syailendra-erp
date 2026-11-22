#!/usr/bin/env python3
"""Normalize supplier refs from legacy ``FMR-*`` to plan codification ``SUP-[KATEGORI]-[NO_URUT]``.

Implements the SUP- codification mandated by the Supplier Master plan
(``Docs/2026-11-05_Plan_Fase1_Modul_Master_Supplier.md``): every vendor ref
must start with ``SUP-`` followed by a category segment and a zero-padded
sequence number (e.g. ``SUP-RAW-001``, ``SUP-PKG-001``, ``SUP-COP-001``).

Dry-run by default: computes the full mapping, writes the artifact JSON to
``scripts/output/supplier_ref_map.json`` (audit trail + legacy-ref lookup
table consumed by ``import_suppliers.py``) and prints aggregate counts only.
Pass ``--apply`` to perform the RPC writes. Idempotent: partners whose ref
already matches ``SUP-*`` are skipped, so re-runs never rewrite twice.

Usage:
    python3 scripts/normalize_supplier_refs.py            # dry-run
    python3 scripts/normalize_supplier_refs.py --apply    # rewrite refs
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ENV_PATH = Path(__file__).resolve().parent.parent / ".env.local"
OUTPUT_DIR = Path(__file__).resolve().parent / "output"
ARTIFACT_PATH = OUTPUT_DIR / "supplier_ref_map.json"

# Child partner-category prefix -> SUP ref segment. Ordered most-specific
# first; matches on the leading numeric code of the category name so minor
# label edits (whitespace/case) never break the mapping.
# SG-12 (owner decision Q16): farmers keep FMR-[REGION]-[SEQ] and are never
# rewritten to the supplier codification by this script.
FARMER_CATEGORY = '1.1 Perorangan Petani'

PREFIX_RULES: list[tuple[str, str]] = [
    ("1.1", "RAW"),   # Perorangan Petani -> raw biomass
    ("1.2", "EO"),    # Perorangan Penyuling -> essential oil
    ("1.3", "RAW"),   # Kelompok Petani/Penyuling
    ("1.4", "COP"),   # Koperasi Tani (plan example: SUP-COP-001)
    ("1.5", "RAW"),   # BUMN / BUMD / BUMDes
    ("1.6", "RAW"),   # Perusahaan Bahan Baku
    ("2.1", "EXP"),   # Perorangan Eksportir
    ("2.2", "EXP"),   # Perusahaan Eksportir
    ("03.", "SAMP"),  # Pemasok Sample R&D
    ("04.", "PKG"),   # Pemasok Sticker & Label
    ("05.", "PKG"),   # Pemasok Botol & Tutup (plan example: SUP-PKG-001)
    ("06.", "GEN"),   # Pemasok Perlengkapan Lainnya
    ("07.", "CHEM"),  # Pemasok Bahan Kimia QC
]
DEFAULT_PREFIX = "GEN"


def prefix_for_category(category: str) -> str:
    for code, segment in PREFIX_RULES:
        if category.startswith(code):
            return segment
    return DEFAULT_PREFIX


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


def build_mapping(client: Odoo) -> tuple[list[dict[str, Any]], dict[str, int], int]:
    """Compute old->new ref mapping for every supplier still on a legacy ref."""
    suppliers = client.kw(
        "res.partner",
        "search_read",
        [[["supplier_rank", ">", 0], ["active", "in", [True, False]]]],
        {"fields": ["ref", "name", "category_id"], "order": "ref asc, id asc"},
    )
    # search_read returns many2many fields as bare id lists; resolve names via
    # a single category lookup instead of per-record reads.
    category_names = {
        row["id"]: row["name"]
        for row in client.kw("res.partner.category", "search_read", [[]], {"fields": ["name"]})
    }
    taken: set[str] = {
        row["ref"]
        for row in client.kw(
            "res.partner", "search_read", [[["ref", "=like", "SUP-%"]]], {"fields": ["ref"]}
        )
        if row.get("ref")
    }

    pending: list[dict[str, Any]] = []
    for row in suppliers:
        ref = (row.get("ref") or "").strip()
        if ref.startswith("SUP-"):
            continue  # already normalized, idempotent skip
        categories = [category_names[cid] for cid in (row.get("category_id") or []) if cid in category_names]
        if FARMER_CATEGORY in categories:
            continue  # farmers own the FMR-* namespace
        segment = DEFAULT_PREFIX
        for name in categories:
            candidate = prefix_for_category(name)
            if candidate != DEFAULT_PREFIX:
                segment = candidate
                break
        pending.append(
            {"id": row["id"], "name": row["name"], "old_ref": ref or None, "segment": segment}
        )

    # Stable numbering per segment, ordered by legacy ref (None sorts last).
    counters: dict[str, int] = {segment: 0 for _code, segment in PREFIX_RULES}
    counters[DEFAULT_PREFIX] = 0
    mappings: list[dict[str, Any]] = []
    for item in sorted(pending, key=lambda r: (r["segment"], r["old_ref"] or "~", r["id"])):
        segment = item["segment"]
        while True:
            counters[segment] += 1
            candidate = f"SUP-{segment}-{counters[segment]:03d}"
            if candidate not in taken:
                break
        taken.add(candidate)
        mappings.append(
            {
                "id": item["id"],
                "name": item["name"],
                "old_ref": item["old_ref"],
                "new_ref": candidate,
            }
        )

    summary: dict[str, int] = {}
    for entry in mappings:
        segment = entry["new_ref"].split("-")[1]
        summary[segment] = summary.get(segment, 0) + 1
    return mappings, summary, len(suppliers)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="actually rewrite refs in Odoo")
    args = parser.parse_args()

    env = read_env(ENV_PATH)
    secret = env.get("ODOO_API_KEY") or env.get("ODOO_PASSWORD", "")
    if not secret:
        raise SystemExit("ODOO_API_KEY / ODOO_PASSWORD missing in .env.local")

    client = Odoo(env["ODOO_BASE_URL"], env["ODOO_DB"], env["ODOO_USERNAME"], secret)
    client.login()
    mappings, summary, total_suppliers = build_mapping(client)

    written = 0
    if args.apply:
        for index, entry in enumerate(mappings, start=1):
            client.kw("res.partner", "write", [[entry["id"]], {"ref": entry["new_ref"]}])
            written = index
            if index % 50 == 0:
                print(f"  ... {index}/{len(mappings)} refs rewritten", file=sys.stderr)

    sup_after = client.kw(
        "res.partner", "search_count", [[["ref", "=like", "SUP-%"], ["supplier_rank", ">", 0]]]
    )
    legacy_after = client.kw(
        "res.partner", "search_count", [[["ref", "=like", "FMR-%"], ["supplier_rank", ">", 0]]]
    )

    artifact = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": "apply" if args.apply else "dry-run",
        "total_suppliers": total_suppliers,
        "mapped": len(mappings),
        "prefix_summary": summary,
        "sup_refs_after": sup_after,
        "legacy_fmr_refs_after": legacy_after,
        "mappings": mappings,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACT_PATH.write_text(json.dumps(artifact, indent=2, ensure_ascii=False), encoding="utf-8")

    print(
        json.dumps(
            {
                "mode": artifact["mode"],
                "total_suppliers": total_suppliers,
                "mapped": len(mappings),
                "written": written,
                "prefix_summary": summary,
                "sup_refs_after": sup_after,
                "legacy_fmr_refs_after": legacy_after,
                "artifact": str(ARTIFACT_PATH),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
