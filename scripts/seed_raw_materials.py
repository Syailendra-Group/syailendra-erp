#!/usr/bin/env python3
"""Seed the two planned RAW materials into ``product.template`` (Odoo 18).

Creates ``RAW-PAT-001`` (dried patchouli leaf) and ``RAW-CIT-001`` (citronella
stem & leaf) as consumable, lot-tracked catalog rows carrying their scientific
metadata as a JSON payload in ``description`` -- the same convention the SCM
Material Master frontend uses (``buildWrite``): plain JSON containing a
``category`` key, which is also what the material listing domain filters on
(``description ilike 'category'``).

Cross-company catalog: no ``company_id`` is set (mirrors the existing EO-* / PKG-*
rows). Idempotent: keyed on ``default_code``; existing codes are skipped.

Dry-run by default: prints the plan and writes ``scripts/output/raw_material_seed_plan.json``.
Pass ``--apply`` to actually create the rows.

Usage:
    python3 scripts/seed_raw_materials.py            # dry-run
    python3 scripts/seed_raw_materials.py --apply    # create rows
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
ARTIFACT_PATH = OUTPUT_DIR / "raw_material_seed_plan.json"

MODEL = "product.template"
BASE_UOM_ID = 1  # Units (system base UoM)
ALL_CATEGORY_ID = 1  # product.category "All"

MATERIALS: list[dict[str, Any]] = [
    {
        "default_code": "RAW-PAT-001",
        "name": "Daun Nilam Kering Petik (Raw Biomass)",
        "metadata": {
            "commercial_name": "Daun Nilam Kering Petik",
            "category": "raw_biomass",
            "botanical_name": "Pogostemon cablin Benth",
            "family": "Lamiaceae",
            "plant_part": "Daun",
            "extraction_method": "none",
            "hs_code": "1211.90.90",
            "shelf_life_months": 12,
            "qc_specs": {
                "max_moisture_pct": 12,
                "max_foreign_matter_pct": 2,
                "min_yield_pct": 2.0,
            },
        },
    },
    {
        "default_code": "RAW-CIT-001",
        "name": "Batang & Daun Serai Wangi Kebun (Raw Biomass)",
        "metadata": {
            "commercial_name": "Batang & Daun Serai Wangi Kebun",
            "category": "raw_biomass",
            "botanical_name": "Cymbopogon winterianus Jowitt",
            "family": "Poaceae",
            "plant_part": "Batang & Daun",
            "extraction_method": "none",
            "hs_code": "1211.90.90",
            "shelf_life_months": 12,
            "qc_specs": {
                "max_moisture_pct": 14,
                "max_foreign_matter_pct": 3,
                "min_yield_pct": 0.7,
            },
        },
    },
]


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
            {"jsonrpc": "2.0", "method": "call", "params": {"service": service, "method": method, "args": args}, "id": self._id}
        ).encode()
        self._id += 1
        req = urllib.request.Request(f"{self.base}/jsonrpc", data=body, headers={"Content-Type": "application/json"})
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
        return self._call("object", "execute_kw", [self.db, self.uid, self.secret, model, method, args, kwargs or {}])


def existing_codes(client: Odoo) -> set[str]:
    rows = client.kw(MODEL, "search_read", [[["default_code", "in", [m["default_code"] for m in MATERIALS]]]], {"fields": ["default_code"]})
    return {row["default_code"] for row in rows if row.get("default_code")}


def build_plan(client: Odoo) -> list[dict[str, Any]]:
    taken = existing_codes(client)
    plan: list[dict[str, Any]] = []
    for item in MATERIALS:
        action = "skip" if item["default_code"] in taken else "create"
        plan.append({"default_code": item["default_code"], "name": item["name"], "action": action})
    return plan


def create_material(client: Odoo, item: dict[str, Any]) -> int:
    values: dict[str, Any] = {
        "name": item["name"],
        "default_code": item["default_code"],
        "type": "consu",
        "tracking": "lot",
        "uom_id": BASE_UOM_ID,
        "categ_id": ALL_CATEGORY_ID,
        "description": json.dumps(item["metadata"], ensure_ascii=False),
    }
    return client.kw(MODEL, "create", [values])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="actually create the material rows")
    args = parser.parse_args()

    env = read_env(ENV_PATH)
    secret = env.get("ODOO_API_KEY") or env.get("ODOO_PASSWORD", "")
    if not secret:
        raise SystemExit("ODOO_API_KEY / ODOO_PASSWORD missing in .env.local")

    client = Odoo(env["ODOO_BASE_URL"], env["ODOO_DB"], env["ODOO_USERNAME"], secret)
    client.login()

    plan = build_plan(client)
    by_code = {item["default_code"]: item for item in MATERIALS}

    created: list[dict[str, Any]] = []
    if args.apply:
        for entry in plan:
            if entry["action"] != "create":
                continue
            new_id = create_material(client, by_code[entry["default_code"]])
            created.append({"default_code": entry["default_code"], "id": new_id})
            print(f"  + created {entry['default_code']} (id {new_id})", file=sys.stderr)

    # Verification: the material listing domain counts rows whose description has "category".
    listed_after = client.kw(
        MODEL,
        "search_count",
        [[["description", "ilike", "category"], ["active", "in", [True, False]]]],
    )
    raw_after = client.kw(MODEL, "search_count", [[["default_code", "=like", "RAW-%"]]])

    artifact = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": "apply" if args.apply else "dry-run",
        "planned_create": sum(1 for e in plan if e["action"] == "create"),
        "planned_skip": sum(1 for e in plan if e["action"] == "skip"),
        "created": created,
        "listed_materials_after": listed_after,
        "raw_materials_after": raw_after,
        "plan": plan,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACT_PATH.write_text(json.dumps(artifact, indent=2, ensure_ascii=False), encoding="utf-8")

    print(
        json.dumps(
            {
                "mode": artifact["mode"],
                "planned_create": artifact["planned_create"],
                "planned_skip": artifact["planned_skip"],
                "created": len(created),
                "listed_materials_after": listed_after,
                "raw_materials_after": raw_after,
                "artifact": str(ARTIFACT_PATH),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
