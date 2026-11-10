import xmlrpc.client
import json
import re
import os
import sys

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
    print("Authentication failed!")
    sys.exit(1)

print(f"Authenticated successfully as UID: {uid}")
models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object")

country = models.execute_kw(db, uid, password, "res.country", "search_read", [[("id", "=", 100)]], {"fields": ["id", "name", "code"]})
if not country:
    country = models.execute_kw(db, uid, password, "res.country", "search_read", [[("code", "=", "ID")]], {"fields": ["id", "name", "code"]})

if not country:
    print("ERROR: Country Indonesia (ID 100) not found in res.country!")
    sys.exit(1)

country_id = country[0]["id"]
print(f"Target Country: {country[0]['name']} (ID: {country_id})")

catalog_path = "/opt/octa/workspace/erp-syailendra/src/data/indonesia-regions/catalog/provinces.json"
with open(catalog_path, "r") as f:
    catalog_provinces = json.load(f)

provinces_ts_path = "/opt/octa/workspace/erp-syailendra/src/data/indonesia-regions/provinces.ts"
aliases = {}
if os.path.exists(provinces_ts_path):
    with open(provinces_ts_path, "r") as f:
        content = f.read()
        matches = re.findall(r"name:\s*'([^']+)',\s*code:\s*'([^']+)'(?:,\s*alias:\s*'([^']+)')?", content)
        for name, code, alias in matches:
            aliases[name] = alias

print(f"Loaded {len(catalog_provinces)} provinces from catalog.")

created_count = 0
updated_count = 0

for item in catalog_provinces:
    c_code = str(item["code"])
    c_name = item["name"]
    
    # Alias is full name without abbreviations
    c_alias = aliases.get(c_name) or c_name
    
    payload = {
        "name": c_name,
        "code": c_code,
        "alias": c_alias,
        "description": f"Provinsi {c_name}, Indonesia",
        "country_id": country_id
    }
    
    domain = [
        "&",
        ("country_id", "=", country_id),
        "|",
        ("code", "=", c_code),
        ("name", "=", c_name)
    ]
    existing = models.execute_kw(db, uid, password, "res.country.state", "search", [domain])
    
    if existing:
        models.execute_kw(db, uid, password, "res.country.state", "write", [existing, payload])
        updated_count += 1
    else:
        new_id = models.execute_kw(db, uid, password, "res.country.state", "create", [payload])
        created_count += 1

print(f"Ingestion complete: {created_count} created, {updated_count} updated.")

total_provinces = models.execute_kw(db, uid, password, "res.country.state", "search_count", [[("country_id", "=", country_id)]])
print(f"Total Provinces in Odoo res.country.state (Indonesia): {total_provinces}")

all_provinces = models.execute_kw(
    db, uid, password, "res.country.state", "search_read",
    [[("country_id", "=", country_id)]],
    {"fields": ["id", "code", "name", "alias", "country_id"], "limit": 50, "order": "code asc"}
)
print("Seeded provinces sample:")
for s in all_provinces[:10]:
    print(f"  [{s['code']}] Name: '{s['name']}' | Alias: '{s['alias']}'")

if total_provinces == 38:
    print("\nSUCCESS: All 38 Indonesian provinces updated and verified 100%!")
else:
    print(f"\nWARNING: Expected 38 provinces, found {total_provinces}")
