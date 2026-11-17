#!/usr/bin/env python3
"""Seed real distillation facilities into ``syailendra.distillery`` (Odoo 18).

Creates the six approved pilot units (SG-7 Sub-Phase D2) that connect real
essential-oil distillers (partner category ``1.2 Perorangan Penyuling``) to the
dedicated ``syailendra.distillery`` model. Region ids are resolved by querying
``res.country.state`` / ``res.country.city`` -- never hardcoded.

Idempotent: keyed on the unique ``code`` (``DST-[WILAYAH]-[NO]``). Facilities
whose ``code`` already exists are skipped, so re-runs never duplicate rows.

Dry-run by default: prints the plan (resolve/validate/skip/create) and writes an
audit artifact to ``scripts/output/distillery_seed_plan.json``. Pass ``--apply``
to actually create the rows.

Usage:
    python3 scripts/seed_distilleries.py            # dry-run
    python3 scripts/seed_distilleries.py --apply    # create rows
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
ARTIFACT_PATH = OUTPUT_DIR / "distillery_seed_plan.json"

MODEL = "syailendra.distillery"
PENYULING_CATEGORY_PREFIX = "1.2"

# Pilot units approved in the SG-7 Sub-Phase D review. boiler_material /
# fuel_type / distillation_method must use the model's Selection values.
FACILITIES: list[dict[str, Any]] = [
    {
        "code": "DST-ACH-001",
        "name": "Unit Suling Nilam Aceh Tengah",
        "partner_ref": "SUP-EO-001",
        "city": "Kabupaten Aceh Tengah",
        "state": "Aceh",
        "address_detail": "Jalan Raya Takengon-Bireuen KM 12, Desa Bies, Kecamatan Bies",
        "distillation_method": "steam",
        "boiler_count": 2,
        "boiler_capacity_kg": 1500,
        "boiler_material": "stainless_304",
        "fuel_type": "firewood",
        "facility_area_m2": 320,
        "avg_duration_hours": 8,
        "operating_temp_c": 100,
        "operating_pressure_bar": 1.2,
        "avg_yield_percent": 2.5,
        "monthly_capacity_kg": 3000,
        "yearly_capacity_kg": 36000,
        "max_capacity_kg": 1500,
        "lead_time_days": 7,
        "moq_kg": 100,
    },
    {
        "code": "DST-JBR-001",
        "name": "Distilasi Serai Wangi Garut",
        "partner_ref": "SUP-EO-002",
        "city": "Kabupaten Garut",
        "state": "Jawa Barat",
        "address_detail": "Kampung Cikajang, Desa Cibodas, Kecamatan Cikajang",
        "distillation_method": "water_steam",
        "boiler_count": 1,
        "boiler_capacity_kg": 800,
        "boiler_material": "stainless_304",
        "fuel_type": "biomass",
        "facility_area_m2": 180,
        "avg_duration_hours": 6,
        "operating_temp_c": 98,
        "operating_pressure_bar": 0.8,
        "avg_yield_percent": 0.8,
        "monthly_capacity_kg": 1600,
        "yearly_capacity_kg": 19200,
        "max_capacity_kg": 800,
        "lead_time_days": 5,
        "moq_kg": 50,
    },
    {
        "code": "DST-SLT-001",
        "name": "Unit Suling Cengkeh Toli Toli",
        "partner_ref": "SUP-EO-003",
        "city": "Kabupaten Toli Toli",
        "state": "Sulawesi Tengah",
        "address_detail": "Jalan Trans Sulawesi, Desa Ogoamas, Kecamatan Dampal Selatan",
        "distillation_method": "steam",
        "boiler_count": 2,
        "boiler_capacity_kg": 1200,
        "boiler_material": "copper",
        "fuel_type": "firewood",
        "facility_area_m2": 260,
        "avg_duration_hours": 7,
        "operating_temp_c": 100,
        "operating_pressure_bar": 1.0,
        "avg_yield_percent": 1.5,
        "monthly_capacity_kg": 2400,
        "yearly_capacity_kg": 28800,
        "max_capacity_kg": 1200,
        "lead_time_days": 10,
        "moq_kg": 80,
    },
    {
        "code": "DST-MLU-001",
        "name": "Distilasi Pala Ternate",
        "partner_ref": "SUP-EO-004",
        "city": "Kota Ternate",
        "state": "Maluku Utara",
        "address_detail": "Kelurahan Kasturian, Kecamatan Ternate Utara",
        "distillation_method": "steam",
        "boiler_count": 1,
        "boiler_capacity_kg": 600,
        "boiler_material": "stainless_304",
        "fuel_type": "lpg",
        "facility_area_m2": 140,
        "avg_duration_hours": 5,
        "operating_temp_c": 100,
        "operating_pressure_bar": 1.0,
        "avg_yield_percent": 3.0,
        "monthly_capacity_kg": 1200,
        "yearly_capacity_kg": 14400,
        "max_capacity_kg": 600,
        "lead_time_days": 14,
        "moq_kg": 40,
    },
    {
        "code": "DST-KLM-001",
        "name": "Unit Suling Gaharu Barito Selatan",
        "partner_ref": "SUP-EO-005",
        "city": "Kabupaten Barito Selatan",
        "state": "Kalimantan Tengah",
        "address_detail": "Jalan Negara Palangka Raya-Banjarmasin KM 8, Desa Sababilah",
        "distillation_method": "hydrodiffusion",
        "boiler_count": 1,
        "boiler_capacity_kg": 400,
        "boiler_material": "stainless_316",
        "fuel_type": "biomass",
        "facility_area_m2": 160,
        "avg_duration_hours": 12,
        "operating_temp_c": 105,
        "operating_pressure_bar": 0.6,
        "avg_yield_percent": 0.3,
        "monthly_capacity_kg": 400,
        "yearly_capacity_kg": 4800,
        "max_capacity_kg": 400,
        "lead_time_days": 21,
        "moq_kg": 20,
    },
    {
        "code": "DST-JTG-001",
        "name": "Distilasi Vetiver Wonogiri",
        "partner_ref": "SUP-EO-006",
        "city": "Kabupaten Wonogiri",
        "state": "Jawa Tengah",
        "address_detail": "Jalan Raya Solo-Wonogiri KM 15, Desa Giritirto, Kecamatan Wonogiri",
        "distillation_method": "water_dist",
        "boiler_count": 2,
        "boiler_capacity_kg": 1000,
        "boiler_material": "stainless_304",
        "fuel_type": "firewood",
        "facility_area_m2": 220,
        "avg_duration_hours": 10,
        "operating_temp_c": 100,
        "operating_pressure_bar": 0.5,
        "avg_yield_percent": 0.5,
        "monthly_capacity_kg": 2000,
        "yearly_capacity_kg": 24000,
        "max_capacity_kg": 1000,
        "lead_time_days": 7,
        "moq_kg": 60,
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


def resolve_city(client: Odoo, city_name: str, state_name: str) -> tuple[int | None, int | None]:
    rows = client.kw(
        "res.country.city",
        "search_read",
        [[["name", "=", city_name]]],
        {"fields": ["id", "name", "state_id"], "limit": 1},
    )
    if rows:
        state = rows[0].get("state_id")
        return rows[0]["id"], (state[0] if isinstance(state, list) and state else None)
    # Fallback: fuzzy match, prefer the requested state
    rows = client.kw(
        "res.country.city",
        "search_read",
        [[["name", "ilike", city_name]]],
        {"fields": ["id", "name", "state_id"], "limit": 5},
    )
    for row in rows:
        state = row.get("state_id")
        if isinstance(state, list) and state and state[1] == state_name:
            return row["id"], state[0]
    return (None, None)


def resolve_penyuling_category(client: Odoo) -> int | None:
    rows = client.kw(
        "res.partner.category",
        "search_read",
        [[["name", "=like", f"{PENYULING_CATEGORY_PREFIX}%"]]],
        {"fields": ["id", "name"], "limit": 1},
    )
    return rows[0]["id"] if rows else None


def resolve_partner(client: Odoo, ref: str, penyuling_cat: int | None) -> tuple[int | None, str]:
    rows = client.kw(
        "res.partner",
        "search_read",
        [[["ref", "=", ref]]],
        {"fields": ["id", "name", "category_id"], "limit": 1},
    )
    if not rows:
        return None, ""
    row = rows[0]
    if penyuling_cat is not None and penyuling_cat not in (row.get("category_id") or []):
        return None, row["name"]
    return row["id"], row["name"]


def existing_codes(client: Odoo) -> set[str]:
    rows = client.kw(
        MODEL,
        "search_read",
        [[["code", "!=", False]]],
        {"fields": ["code"]},
    )
    return {row["code"] for row in rows if row.get("code")}


def build_plan(client: Odoo) -> list[dict[str, Any]]:
    penyuling_cat = resolve_penyuling_category(client)
    taken = existing_codes(client)
    plan: list[dict[str, Any]] = []

    for item in FACILITIES:
        entry: dict[str, Any] = {"code": item["code"], "name": item["name"]}
        city_id, state_id = resolve_city(client, item["city"], item["state"])
        partner_id, partner_name = resolve_partner(client, item["partner_ref"], penyuling_cat)
        entry.update(
            {
                "city_id": city_id,
                "state_id": state_id,
                "partner_ref": item["partner_ref"],
                "partner_id": partner_id,
                "partner_name": partner_name,
            }
        )

        if item["code"] in taken:
            entry["action"] = "skip"
            entry["reason"] = "code already exists"
        elif city_id is None or state_id is None:
            entry["action"] = "error"
            entry["reason"] = f"region not resolved ({item['city']})"
        elif partner_id is None:
            entry["action"] = "error"
            entry["reason"] = f"partner not resolved / not penyuling ({item['partner_ref']})"
        else:
            entry["action"] = "create"
        plan.append(entry)

    return plan


def create_facility(client: Odoo, item: dict[str, Any], resolved: dict[str, Any]) -> int:
    values: dict[str, Any] = {
        "name": item["name"],
        "code": item["code"],
        "partner_id": resolved["partner_id"],
        "state_id": resolved["state_id"],
        "city_id": resolved["city_id"],
        "address_detail": item["address_detail"],
        "distillation_method": item["distillation_method"],
        "boiler_count": item["boiler_count"],
        "boiler_capacity_kg": item["boiler_capacity_kg"],
        "boiler_material": item["boiler_material"],
        "fuel_type": item["fuel_type"],
        "facility_area_m2": item["facility_area_m2"],
        "avg_duration_hours": item["avg_duration_hours"],
        "operating_temp_c": item["operating_temp_c"],
        "operating_pressure_bar": item["operating_pressure_bar"],
        "avg_yield_percent": item["avg_yield_percent"],
        "monthly_capacity_kg": item["monthly_capacity_kg"],
        "yearly_capacity_kg": item["yearly_capacity_kg"],
        "max_capacity_kg": item["max_capacity_kg"],
        "lead_time_days": item["lead_time_days"],
        "moq_kg": item["moq_kg"],
    }
    return client.kw(MODEL, "create", [values])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--apply", action="store_true", help="actually create the distillery rows")
    args = parser.parse_args()

    env = read_env(ENV_PATH)
    secret = env.get("ODOO_API_KEY") or env.get("ODOO_PASSWORD", "")
    if not secret:
        raise SystemExit("ODOO_API_KEY / ODOO_PASSWORD missing in .env.local")

    client = Odoo(env["ODOO_BASE_URL"], env["ODOO_DB"], env["ODOO_USERNAME"], secret)
    client.login()

    plan = build_plan(client)
    by_code = {item["code"]: item for item in FACILITIES}

    created: list[dict[str, Any]] = []
    if args.apply:
        for entry in plan:
            if entry["action"] != "create":
                continue
            new_id = create_facility(client, by_code[entry["code"]], entry)
            created.append({"code": entry["code"], "id": new_id})
            print(f"  + created {entry['code']} (id {new_id})", file=sys.stderr)

    total_after = client.kw(MODEL, "search_count", [[]])

    artifact = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": "apply" if args.apply else "dry-run",
        "total_facilities_after": total_after,
        "planned_create": sum(1 for e in plan if e["action"] == "create"),
        "planned_skip": sum(1 for e in plan if e["action"] == "skip"),
        "planned_error": sum(1 for e in plan if e["action"] == "error"),
        "created": created,
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
                "planned_error": artifact["planned_error"],
                "created": len(created),
                "total_facilities_after": total_after,
                "artifact": str(ARTIFACT_PATH),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
