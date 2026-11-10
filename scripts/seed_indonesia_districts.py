import xmlrpc.client
import json
import os
import sys
import time

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

    # 1. Target Country: Indonesia (ID 100)
    country_id = 100

    # 2. Load 514 Regencies from Odoo res.country.city
    print("Loading 514 regencies from Odoo...")
    regencies = models.execute_kw(
        db, uid, password, "res.country.city", "search_read",
        [[("country_id", "=", country_id)]],
        {"fields": ["id", "code", "name", "state_id"], "limit": 1000}
    )
    reg_by_code = {r["code"]: r for r in regencies if r.get("code")}
    reg_by_name = {r["name"].lower(): r for r in regencies if r.get("name")}
    print(f"Loaded {len(regencies)} regencies from Odoo.")

    # 3. Load Districts Catalog (all-districts.json)
    catalog_path = "/opt/octa/workspace/erp-syailendra/src/data/indonesia-regions/catalog/all-districts.json"
    if not os.path.exists(catalog_path):
        print(f"ERROR: Catalog not found at {catalog_path}")
        sys.exit(1)

    with open(catalog_path, "r") as f:
        catalog_districts = json.load(f)

    print(f"Loaded {len(catalog_districts)} districts from official catalog.")

    # 4. Fetch Existing res.country.district in Odoo
    print("Fetching existing districts in Odoo res.country.district...")
    existing = models.execute_kw(
        db, uid, password, "res.country.district", "search_read",
        [[("country_id", "=", country_id)]],
        {"fields": ["id", "code", "name"], "limit": 10000}
    )
    existing_by_code = {r["code"]: r["id"] for r in existing if r.get("code")}
    print(f"Found {len(existing)} existing district records in Odoo.")

    created_count = 0
    updated_count = 0
    to_create = []

    start_time = time.time()

    for item in catalog_districts:
        code = str(item["code"])
        name = item["name"]
        alias = item.get("alias") or name
        reg_code = str(item.get("regencyCode", ""))

        # Resolve parent regency
        reg = reg_by_code.get(reg_code)
        if not reg:
            print(f"WARNING: Regency code {reg_code} not found for district {name} ({code})! Skipping...")
            continue

        city_id = reg["id"]
        state_id = reg["state_id"][0] if reg.get("state_id") else False
        reg_name = reg["name"]
        prov_name = reg["state_id"][1] if reg.get("state_id") else "Indonesia"

        description = f"{name}, {reg_name}, {prov_name}, Indonesia"

        payload = {
            "name": name,
            "code": code,
            "alias": alias,
            "description": description,
            "country_id": country_id,
            "state_id": state_id,
            "city_id": city_id,
            "latitude": 0.0,
            "longitude": 0.0,
            "active": True
        }

        existing_id = existing_by_code.get(code)
        if existing_id:
            models.execute_kw(db, uid, password, "res.country.district", "write", [[existing_id], payload])
            updated_count += 1
        else:
            to_create.append(payload)

    # 5. Batch create new records
    if to_create:
        chunk_size = 250
        total_batches = (len(to_create) + chunk_size - 1) // chunk_size
        print(f"Starting batch creation of {len(to_create)} districts across {total_batches} batches (chunk_size={chunk_size})...")
        for i in range(0, len(to_create), chunk_size):
            chunk = to_create[i:i + chunk_size]
            batch_num = (i // chunk_size) + 1
            models.execute_kw(db, uid, password, "res.country.district", "create", [chunk])
            created_count += len(chunk)
            print(f"  Batch {batch_num}/{total_batches}: Created {len(chunk)} records (Total so far: {created_count})...")

    duration = time.time() - start_time
    print(f"\nIngestion finished in {duration:.2f} seconds!")
    print(f"Result: {created_count} created, {updated_count} updated.")

    # 6. Verification
    total_districts = models.execute_kw(
        db, uid, password, "res.country.district", "search_count",
        [[("country_id", "=", country_id)]]
    )
    print(f"\nTotal Districts in Odoo res.country.district: {total_districts}")

    # Inspect sample records
    samples = models.execute_kw(
        db, uid, password, "res.country.district", "search_read",
        [[("country_id", "=", country_id)]],
        {"fields": ["id", "code", "name", "alias", "city_id", "state_id"], "limit": 10, "order": "code asc"}
    )
    print("\nSample Seeded Districts:")
    for s in samples:
        city_lbl = s["city_id"][1] if s.get("city_id") else "-"
        state_lbl = s["state_id"][1] if s.get("state_id") else "-"
        print(f"  [{s['code']}] {s['name']} (Alias: {s['alias']}) -> {city_lbl} | {state_lbl}")

    if total_districts == 7288:
        print("\nSUCCESS: All 7,288 Indonesian districts verified 100% in Odoo database!")
    else:
        print(f"\nSTATUS: Found {total_districts} districts.")

if __name__ == "__main__":
    main()
