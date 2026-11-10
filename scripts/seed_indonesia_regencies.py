import xmlrpc.client
import json
import re
import os
import sys

def main():
    env_path = "/opt/octa/workspace/erp-syailendra/.env.local"
    env = {}
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")

    url = env.get("ODOO_SERVER_URL", "http://localhost:8069")
    db = env.get("ODOO_DB", "odoo_dev")
    username = env.get("ODOO_USERNAME")
    password = env.get("ODOO_PASSWORD")

    common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
    uid = common.authenticate(db, username, password, {})
    if not uid:
        print("ERROR: Authentication failed!")
        sys.exit(1)

    print(f"Authenticated successfully as UID: {uid}")
    models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object")

    # 1. Target Country: Indonesia
    country = models.execute_kw(db, uid, password, "res.country", "search_read", [[("id", "=", 100)]], {"fields": ["id", "name", "code"]})
    if not country:
        country = models.execute_kw(db, uid, password, "res.country", "search_read", [[("code", "=", "ID")]], {"fields": ["id", "name", "code"]})

    if not country:
        print("ERROR: Country Indonesia (ID 100) not found in res.country!")
        sys.exit(1)

    country_id = country[0]["id"]
    print(f"Target Country: {country[0]['name']} (ID: {country_id})")

    # 2. Load 38 Indonesian Provinces from Odoo
    states = models.execute_kw(
        db, uid, password, "res.country.state", "search_read",
        [[("country_id", "=", country_id)]],
        {"fields": ["id", "code", "name"], "limit": 100}
    )
    state_map_by_code = {s["code"]: s for s in states}
    state_map_by_name = {s["name"].lower(): s for s in states}
    print(f"Loaded {len(states)} provinces from Odoo res.country.state.")

    # 3. Load Curated Coordinates & Aliases from regencies.ts
    regencies_ts_path = "/opt/octa/workspace/erp-syailendra/src/data/indonesia-regions/regencies.ts"
    coords_map = {}
    ts_aliases = {}
    if os.path.exists(regencies_ts_path):
        with open(regencies_ts_path, "r") as f:
            content = f.read()
            blocks = re.findall(
                r"name:\s*'([^']+)',\s*code:\s*'([^']+)',\s*alias:\s*'([^']*)',\s*provinceName:\s*'([^']*)',\s*provinceCode:\s*'([^']*)',\s*latitude:\s*([-\d\.]+),\s*longitude:\s*([-\d\.]+)",
                content
            )
            for name, code, alias, p_name, p_code, lat, lng in blocks:
                coords_map[code] = (float(lat), float(lng))
                if alias:
                    ts_aliases[code] = alias

    print(f"Loaded {len(coords_map)} curated coordinates from regencies.ts.")

    # 4. Load Catalog (all 514 Regencies)
    catalog_path = "/opt/octa/workspace/erp-syailendra/src/data/indonesia-regions/catalog/all-regencies.json"
    with open(catalog_path, "r") as f:
        catalog_regencies = json.load(f)

    print(f"Loaded {len(catalog_regencies)} regencies from official catalog.")

    # 5. Fetch Existing res.country.city records in Odoo
    existing_records = models.execute_kw(
        db, uid, password, "res.country.city", "search_read",
        [[("country_id", "=", country_id)]],
        {"fields": ["id", "code", "name"], "limit": 1000}
    )
    existing_by_code = {r["code"]: r["id"] for r in existing_records if r.get("code")}
    existing_by_name = {r["name"].lower(): r["id"] for r in existing_records if r.get("name")}
    print(f"Found {len(existing_records)} existing regency records in Odoo.")

    created_count = 0
    updated_count = 0
    to_create = []

    for item in catalog_regencies:
        code = str(item["code"])
        name = item["name"]
        p_code = str(item.get("provinceCode", ""))
        p_name = item.get("provinceName", "")
        
        # Resolve State/Province ID
        state_record = state_map_by_code.get(p_code) or state_map_by_name.get(p_name.lower())
        if not state_record:
            print(f"WARNING: Province {p_name} ({p_code}) not found for {name} ({code})! Skipping...")
            continue
        state_id = state_record["id"]

        # Alias resolution
        alias = item.get("alias") or ts_aliases.get(code) or False

        # Coordinates resolution
        lat, lng = coords_map.get(code, (0.0, 0.0))

        description = f"{name}, Provinsi {p_name}, Indonesia"

        payload = {
            "name": name,
            "code": code,
            "alias": alias,
            "description": description,
            "country_id": country_id,
            "state_id": state_id,
            "latitude": lat,
            "longitude": lng,
            "active": True
        }

        # Check existing
        existing_id = existing_by_code.get(code) or existing_by_name.get(name.lower())
        if existing_id:
            models.execute_kw(db, uid, password, "res.country.city", "write", [[existing_id], payload])
            updated_count += 1
        else:
            to_create.append(payload)

    # Batch create new records
    if to_create:
        chunk_size = 50
        for i in range(0, len(to_create), chunk_size):
            chunk = to_create[i:i + chunk_size]
            models.execute_kw(db, uid, password, "res.country.city", "create", [chunk])
            created_count += len(chunk)
            print(f"  Created batch {i + 1} to {min(i + chunk_size, len(to_create))} of {len(to_create)}...")

    print(f"\nIngestion complete: {created_count} created, {updated_count} updated.")

    # 6. Verification
    total_regencies = models.execute_kw(
        db, uid, password, "res.country.city", "search_count",
        [[("country_id", "=", country_id)]]
    )
    print(f"Total Regencies in Odoo res.country.city (Indonesia): {total_regencies}")

    sample_records = models.execute_kw(
        db, uid, password, "res.country.city", "search_read",
        [[("country_id", "=", country_id)]],
        {"fields": ["id", "code", "name", "alias", "state_id", "country_id", "latitude", "longitude"], "limit": 10, "order": "code asc"}
    )
    print("\nSample seeded regencies:")
    for s in sample_records:
        prov_name = s["state_id"][1] if s["state_id"] else "-"
        country_name = s["country_id"][1] if s["country_id"] else "-"
        print(f"  [{s['code']}] {s['name']} (Alias: {s['alias']}) - Prov: {prov_name} - GPS: ({s['latitude']}, {s['longitude']})")

    if total_regencies == 514:
        print("\nSUCCESS: All 514 Indonesian regencies/cities seeded and verified 100%!")
    else:
        print(f"\nWARNING: Expected 514 regencies, found {total_regencies}")

if __name__ == "__main__":
    main()
