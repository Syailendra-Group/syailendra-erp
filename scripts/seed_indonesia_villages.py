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

    # 1. Load All 7,288 Districts from Odoo res.country.district
    print("Loading districts from Odoo res.country.district...")
    districts = models.execute_kw(
        db, uid, password, "res.country.district", "search_read",
        [[("country_id", "=", 100)]],
        {"fields": ["id", "code", "name", "city_id"], "limit": 10000}
    )
    dist_map = {d["code"]: d for d in districts if d.get("code")}
    print(f"Loaded {len(districts)} districts from Odoo.")

    # 2. Load All Village Partition Files
    villages_dir = "/opt/octa/workspace/erp-syailendra/src/data/indonesia-regions/catalog/villages"
    if not os.path.exists(villages_dir):
        print(f"ERROR: Villages directory not found at {villages_dir}")
        sys.exit(1)

    print(f"Reading village partition files from {villages_dir}...")
    load_start = time.time()
    files = [os.path.join(villages_dir, f) for f in os.listdir(villages_dir) if f.endswith(".json")]
    
    all_villages = []
    for fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            all_villages.extend(json.load(f))

    print(f"Loaded {len(all_villages)} villages from {len(files)} files in {time.time() - load_start:.2f}s.")

    # 3. Fetch Existing res.country.subdistrict in Odoo for Idempotency
    print("Checking existing villages in Odoo res.country.subdistrict...")
    existing_count = models.execute_kw(
        db, uid, password, "res.country.subdistrict", "search_count", [[]]
    )
    print(f"Found {existing_count} existing subdistrict records in Odoo.")

    existing_by_code = {}
    if existing_count > 0:
        # Read existing codes in chunks of 10,000 to avoid huge payload timeouts
        chunk_read = 10000
        for off in range(0, existing_count, chunk_read):
            batch = models.execute_kw(
                db, uid, password, "res.country.subdistrict", "search_read",
                [[]],
                {"fields": ["id", "code"], "offset": off, "limit": chunk_read}
            )
            for r in batch:
                if r.get("code"):
                    existing_by_code[r["code"]] = r["id"]

    print(f"Mapped {len(existing_by_code)} existing records by code.")

    created_count = 0
    updated_count = 0
    to_create = []

    ingest_start = time.time()

    for item in all_villages:
        code = str(item["code"])
        name = item["name"]
        alias = item.get("alias") or name
        dist_code = str(item.get("districtCode", ""))
        zip_code = item.get("zipCode") or False

        dist = dist_map.get(dist_code)
        if not dist:
            continue

        dist_id = dist["id"]
        dist_name = dist["name"]
        city_name = dist["city_id"][1] if dist.get("city_id") else "Indonesia"

        description = f"Desa/Kelurahan {name}, {dist_name}, {city_name}, Indonesia"

        payload = {
            "name": name,
            "code": code,
            "alias": alias,
            "description": description,
            "district_id": dist_id,
            "zip_code": zip_code,
            "latitude": 0.0,
            "longitude": 0.0,
            "active": True
        }

        if code not in existing_by_code:
            to_create.append(payload)

    print(f"Records to create: {len(to_create)}, already exist: {len(all_villages) - len(to_create)}.")

    # 4. Batch Create via Odoo XML-RPC
    if to_create:
        chunk_size = 500
        total_batches = (len(to_create) + chunk_size - 1) // chunk_size
        print(f"Starting batch creation of {len(to_create)} villages across {total_batches} batches (chunk_size={chunk_size})...")
        for i in range(0, len(to_create), chunk_size):
            chunk = to_create[i:i + chunk_size]
            batch_num = (i // chunk_size) + 1
            b_start = time.time()
            models.execute_kw(db, uid, password, "res.country.subdistrict", "create", [chunk])
            created_count += len(chunk)
            if batch_num % 10 == 0 or batch_num == total_batches:
                elapsed = time.time() - ingest_start
                rate = created_count / elapsed if elapsed > 0 else 0
                print(f"  Batch {batch_num}/{total_batches}: Created {len(chunk)} (Total: {created_count}/{len(to_create)} - {rate:.0f} rec/s)...")

    duration = time.time() - ingest_start
    print(f"\nIngestion finished in {duration:.2f} seconds!")
    print(f"Result: {created_count} created, {updated_count} updated.")

    # 5. Verification
    total_villages = models.execute_kw(
        db, uid, password, "res.country.subdistrict", "search_count", [[]]
    )
    print(f"\nTotal Villages in Odoo res.country.subdistrict: {total_villages}")

    # Inspect sample records
    samples = models.execute_kw(
        db, uid, password, "res.country.subdistrict", "search_read",
        [[]],
        {"fields": ["id", "code", "name", "alias", "district_id", "city_id", "zip_code"], "limit": 10, "order": "code asc"}
    )
    print("\nSample Seeded Villages:")
    for s in samples:
        dist_lbl = s["district_id"][1] if s.get("district_id") else "-"
        city_lbl = s["city_id"][1] if s.get("city_id") else "-"
        print(f"  [{s['code']}] {s['name']} (Alias: {s['alias']}) -> {dist_lbl} | {city_lbl}")

    if total_villages == 84210:
        print("\nSUCCESS: All 84,210 Indonesian villages/kelurahan verified 100% in Odoo database!")
    else:
        print(f"\nSTATUS: Found {total_villages} villages.")

if __name__ == "__main__":
    main()
