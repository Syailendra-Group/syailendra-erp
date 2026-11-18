#!/usr/bin/env python3
"""Classify existing SCM suppliers into the flat supplier-type master (Odoo 18).

Reads every supplier (``supplier_rank > 0``) with its procurement categories and
maps it to one of the shipped ``syailendra.supplier.type`` records, then sets
``res.partner.supplier_type_id`` and ``supplier_type_needs_review``.

Classification policy is a decision, not a verified fact: upstream actors
(1.1/1.2/1.3/1.4/1.6/2.2) are mapped directly, while the procurement-group
categories (03.-07.) and the unclassified ones are flagged for human review via
``supplier_type_needs_review``. Categories are never modified.

Rows already classified by a human are never touched again: clearing the review
flag is what marks a record as verified, so a later run skips it.

Dry-run by default: prints the plan and writes a timestamped artifact under
``scripts/output/``. Pass ``--apply`` to write, ``--rollback`` to revert the most
recent apply (only rows still holding the values it wrote).

Usage:
    python3 scripts/migrate_supplier_types.py                # dry-run
    python3 scripts/migrate_supplier_types.py --apply        # write
    python3 scripts/migrate_supplier_types.py --rollback     # revert own writes
"""

from __future__ import annotations

import argparse
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ENV_PATH = Path(__file__).resolve().parent.parent / ".env.local"
OUTPUT_DIR = Path(__file__).resolve().parent / "output"

MODULE = "syailendra_scm"
TYPE_MODEL = "syailendra.supplier.type"
PARTNER_MODEL = "res.partner"

TYPE_XML_IDS: dict[str, str] = {
    "Petani": "st_petani",
    "Penyuling": "st_penyuling",
    "Pengepul": "st_pengepul",
    "Koperasi": "st_koperasi",
    "Kelompok Tani": "st_kelompok_tani",
    "UMKM": "st_umkm",
    "Perusahaan": "st_perusahaan",
}

# (category-name prefix, target type name or None, needs review). Longest
# prefix wins, mirroring scripts/import_suppliers.py PREFIX_RULES.
CLASSIFICATION_RULES: list[tuple[str, str | None, bool]] = [
    ("1.1", "Petani", False),
    ("1.2", "Penyuling", False),
    ("1.3", "Kelompok Tani", False),
    ("1.4", "Koperasi", False),
    ("1.6", "Perusahaan", False),
    ("2.2", "Perusahaan", False),
    ("1.5", None, True),
    ("2.1", None, True),
    ("03.", "Perusahaan", True),
    ("04.", "Perusahaan", True),
    ("05.", "UMKM", True),
    ("06.", "UMKM", True),
    ("07.", "Perusahaan", True),
]


def resolve_classification(category_names: list[str]) -> dict[str, Any]:
    """Map category names to a supplier type.

    Returns ``type_name`` (or ``None`` when left unclassified) and
    ``needs_review``. Anything unmatched is unclassified and flagged.
    """
    for prefix, type_name, needs_review in sorted(
        CLASSIFICATION_RULES, key=lambda rule: len(rule[0]), reverse=True
    ):
        for name in category_names:
            if name and name.startswith(prefix):
                return {
                    "type_name": type_name,
                    "needs_review": needs_review,
                    "matched_prefix": prefix,
                }
    return {"type_name": None, "needs_review": True, "matched_prefix": None}


def plan_action(
    previous_type_id: int | bool,
    previous_review: bool,
    new_type_id: int | bool,
    new_review: bool,
) -> tuple[str, str | None]:
    """Decide what to do with one partner.

    A record that already carries a type and is NOT flagged for review has been
    verified by a human, so it is never rewritten by a later run.
    """
    if previous_type_id and not previous_review:
        return "skip", "human_verified"
    if previous_type_id != new_type_id or previous_review != new_review:
        return "update", None
    return "skip", "already_current"


def read_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


class Odoo:
    def __init__(self, base: str, db: str, user: str, secret: str) -> None:
        self.base, self.db, self.user, self.secret, self.uid, self._id = base, db, user, secret, None, 1

    def _call(self, service: str, method: str, args: list[Any]) -> Any:
        body = json.dumps(
            {"jsonrpc": "2.0", "method": "call", "params": {"service": service, "method": method, "args": args}, "id": self._id}
        ).encode()
        self._id += 1
        req = urllib.request.Request(f"{self.base}/jsonrpc", data=body, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
        if "error" in data:
            raise RuntimeError(data["error"].get("data", {}).get("message", "rpc_error"))
        return data["result"]

    def login(self) -> None:
        self.uid = self._call("common", "authenticate", [self.db, self.user, self.secret, {}])
        if not self.uid:
            raise SystemExit("odoo authentication failed")

    def kw(self, model: str, method: str, args: list[Any], kwargs: dict | None = None) -> Any:
        return self._call("object", "execute_kw", [self.db, self.uid, self.secret, model, method, args, kwargs or {}])


def resolve_type_ids(client: Odoo) -> dict[str, int]:
    """Resolve catalog ids through XML IDs and refuse an incomplete catalog."""
    rows = client.kw(
        "ir.model.data",
        "search_read",
        [[["module", "=", MODULE], ["model", "=", TYPE_MODEL]]],
        {"fields": ["name", "res_id"]},
    )
    by_xml_id = {row["name"]: row["res_id"] for row in rows}
    missing = [xml_id for xml_id in TYPE_XML_IDS.values() if xml_id not in by_xml_id]
    if missing:
        raise SystemExit(
            "master types missing: %s -- upgrade %s before migrating" % (", ".join(missing), MODULE)
        )

    ids = {name: by_xml_id[xml_id] for name, xml_id in TYPE_XML_IDS.items()}
    catalog = client.kw(TYPE_MODEL, "read", [list(ids.values()), ["name", "code", "active"]])

    problems: list[str] = []
    if len(catalog) != len(ids):
        problems.append("expected %d catalog rows, got %d" % (len(ids), len(catalog)))
    for record in catalog:
        if not record.get("active"):
            problems.append("%s is archived" % record.get("name"))
        if not record.get("code"):
            problems.append("%s has no code" % record.get("name"))
    if {record["name"] for record in catalog} != set(ids):
        problems.append("catalog names do not match the expected seven types")
    if problems:
        raise SystemExit("catalog invalid: " + "; ".join(problems))
    return ids


def fetch_suppliers(client: Odoo) -> list[dict[str, Any]]:
    return client.kw(
        PARTNER_MODEL,
        "search_read",
        [[["supplier_rank", ">", 0]]],
        {
            "fields": ["id", "ref", "name", "category_id", "supplier_type_id", "supplier_type_needs_review", "active"],
            "context": {"active_test": False},
        },
    )


def fetch_category_names(client: Odoo) -> dict[int, str]:
    rows = client.kw(
        "res.partner.category", "search_read", [[]],
        {"fields": ["id", "name"], "context": {"active_test": False}},
    )
    return {row["id"]: row["name"] for row in rows}


def build_plan(client: Odoo) -> dict[str, Any]:
    type_ids = resolve_type_ids(client)
    names = fetch_category_names(client)
    entries: list[dict[str, Any]] = []
    unmatched: dict[str, int] = {}

    for partner in fetch_suppliers(client):
        category_names = [names.get(cid, "") for cid in partner.get("category_id") or []]
        label = " | ".join(name for name in category_names if name)
        decision = resolve_classification(category_names)
        new_type_id = type_ids[decision["type_name"]] if decision["type_name"] else False
        previous_type_id = (partner.get("supplier_type_id") or [False])[0] or False
        previous_review = bool(partner.get("supplier_type_needs_review"))
        action, reason = plan_action(
            previous_type_id, previous_review, new_type_id, decision["needs_review"]
        )

        if decision["matched_prefix"] is None and label:
            unmatched[label] = unmatched.get(label, 0) + 1

        entries.append({
            "partner_id": partner["id"],
            "ref": partner.get("ref") or "",
            "partner_name": partner["name"],
            "category_label": label,
            "matched_prefix": decision["matched_prefix"],
            "action": action,
            "skip_reason": reason,
            "previous_type_id": previous_type_id,
            "new_type_id": new_type_id,
            "previous_needs_review": previous_review,
            "new_needs_review": decision["needs_review"],
        })

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_suppliers": len(entries),
        "to_update": sum(1 for entry in entries if entry["action"] == "update"),
        "to_skip": sum(1 for entry in entries if entry["action"] == "skip"),
        "protected_human_verified": sum(1 for entry in entries if entry["skip_reason"] == "human_verified"),
        "needs_review_true": sum(1 for entry in entries if entry["new_needs_review"]),
        "unmatched_categories": unmatched,
        "entries": entries,
    }


def _stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def applied_artifacts() -> list[Path]:
    return sorted(OUTPUT_DIR.glob("supplier_type_migration_applied_*.json"))


def command_apply(client: Odoo, plan: dict[str, Any]) -> dict[str, Any]:
    applied: list[dict[str, Any]] = []
    for entry in plan["entries"]:
        if entry["action"] != "update":
            continue
        client.kw(PARTNER_MODEL, "write", [[entry["partner_id"]], {
            "supplier_type_id": entry["new_type_id"],
            "supplier_type_needs_review": entry["new_needs_review"],
        }])
        applied.append(entry)

    snapshot = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "applied_count": len(applied),
        "entries": applied,
    }
    # One artifact per apply, never overwriting an earlier snapshot.
    path = OUTPUT_DIR / ("supplier_type_migration_applied_%s.json" % _stamp())
    path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False), encoding="utf-8")
    snapshot["artifact"] = str(path)
    return snapshot


def command_rollback(client: Odoo, artifact: Path | None = None) -> dict[str, Any]:
    if artifact is None:
        artifacts = applied_artifacts()
        if not artifacts:
            raise SystemExit("no applied artifact in %s" % OUTPUT_DIR)
        artifact = artifacts[-1]
    snapshot = json.loads(artifact.read_text(encoding="utf-8"))
    reverted, skipped = 0, 0
    for entry in snapshot.get("entries", []):
        rows = client.kw(PARTNER_MODEL, "read", [[entry["partner_id"]], ["supplier_type_id", "supplier_type_needs_review"]])
        if not rows:
            skipped += 1
            continue
        row = rows[0]
        current_type_id = (row.get("supplier_type_id") or [False])[0] or False
        if current_type_id != entry["new_type_id"] or bool(row.get("supplier_type_needs_review")) != entry["new_needs_review"]:
            skipped += 1  # edited since migration: leave it alone
            continue
        client.kw(PARTNER_MODEL, "write", [[entry["partner_id"]], {
            "supplier_type_id": entry["previous_type_id"],
            "supplier_type_needs_review": entry["previous_needs_review"],
        }])
        reverted += 1
    return {"artifact": str(artifact), "reverted": reverted, "skipped_manual_edits": skipped}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="write supplier_type_id / review flag")
    parser.add_argument("--rollback", action="store_true", help="revert rows written by the last --apply")
    parser.add_argument("--artifact", help="rollback from a specific apply artifact")
    args = parser.parse_args()

    env = read_env(ENV_PATH)
    secret = env.get("ODOO_API_KEY") or env.get("ODOO_PASSWORD", "")
    if not secret:
        raise SystemExit("ODOO_API_KEY / ODOO_PASSWORD missing in .env.local")

    client = Odoo(env["ODOO_BASE_URL"], env["ODOO_DB"], env["ODOO_USERNAME"], secret)
    client.login()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.rollback:
        result = command_rollback(client, Path(args.artifact) if args.artifact else None)
        print(json.dumps(result, indent=2))
        return 0

    plan = build_plan(client)
    plan_path = OUTPUT_DIR / ("supplier_type_migration_plan_%s.json" % _stamp())
    plan_path.write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({k: v for k, v in plan.items() if k != "entries"}, indent=2))

    if not args.apply:
        print("dry-run: artifact at %s" % plan_path)
        return 0

    result = command_apply(client, plan)
    print("applied %d rows; artifact at %s" % (result["applied_count"], result["artifact"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
