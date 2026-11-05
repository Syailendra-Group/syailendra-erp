import xmlrpc.client
import os

env_path = '/opt/octa/workspace/erp-syailendra/.env.local'
env = {}
with open(env_path, 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

url = env.get('ODOO_SERVER_URL', 'http://localhost:8069')
db = env.get('ODOO_DB', 'odoo_dev')
username = env.get('ODOO_USERNAME', 'admin')
password = env.get('ODOO_PASSWORD', '')

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})
if not uid:
    print("Authentication failed!")
    exit(1)

print(f"Authenticated successfully as uid: {uid}")
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

print("\n--- STEP 1: PURGING OLD DDISTILLERS CATEGORIES ---")
old_categories = models.execute_kw(
    db, uid, password, 'res.partner.category', 'search_read',
    [[['name', '!=', False]]],
    {'fields': ['id', 'name', 'parent_id']}
)

prefixes = ['01.', '02.', '03.', '04.', '1.', '05.', '06.', '07.', '2.']
to_delete_children = []
to_delete_roots = []

for c in old_categories:
    if any(c['name'].startswith(p) for p in prefixes):
        if c['parent_id']:
            to_delete_children.append(c['id'])
        else:
            to_delete_roots.append(c['id'])

if to_delete_children:
    models.execute_kw(db, uid, password, 'res.partner.category', 'unlink', [to_delete_children])
    print(f"Deleted {len(to_delete_children)} child categories.")

if to_delete_roots:
    models.execute_kw(db, uid, password, 'res.partner.category', 'unlink', [to_delete_roots])
    print(f"Deleted {len(to_delete_roots)} root categories.")

print("\n--- STEP 2: FRESH INJECTION OF 14 HIERARCHICAL CATEGORIES ---")
HIERARCHY_TREE = [
    {
        "name": "01. Bahan Baku & Minyak Atsiri",
        "color": 5,
        "children": [
            {"name": "1.1 Perorangan Petani", "color": 5},
            {"name": "1.2 Perorangan Penyuling", "color": 6},
            {"name": "1.3 Kelompok Petani/Penyuling", "color": 6},
            {"name": "1.4 Koperasi Tani", "color": 8},
            {"name": "1.5 BUMN / BUMD / BUMDes", "color": 9},
            {"name": "1.6 Perusahaan Bahan Baku", "color": 8},
        ]
    },
    {
        "name": "02. Kemasan & Botol",
        "color": 7,
        "children": [
            {"name": "04. Pemasok Sticker & Label", "color": 2},
            {"name": "05. Pemasok Botol & Tutup", "color": 7},
        ]
    },
    {
        "name": "03. Sampel & Bahan Kimia Lab",
        "color": 10,
        "children": [
            {"name": "03. Pemasok Sample R&D", "color": 10},
            {"name": "07. Pemasok Bahan Kimia QC", "color": 11},
        ]
    },
    {
        "name": "04. Perlengkapan & Perantara Ekspor",
        "color": 3,
        "children": [
            {"name": "06. Pemasok Perlengkapan Lainnya", "color": 3},
            {"name": "2.1 Perorangan Eksportir", "color": 4},
            {"name": "2.2 Perusahaan Eksportir", "color": 4},
        ]
    }
]

created_roots = 0
created_children = 0

for root in HIERARCHY_TREE:
    root_id = models.execute_kw(
        db, uid, password, 'res.partner.category', 'create',
        [{'name': root['name'], 'color': root['color'], 'parent_id': False, 'active': True}]
    )
    created_roots += 1
    print(f"📁 Created Root Category: '{root['name']}' (ID: {root_id})")

    for child in root['children']:
        child_id = models.execute_kw(
            db, uid, password, 'res.partner.category', 'create',
            [{'name': child['name'], 'color': child['color'], 'parent_id': root_id, 'active': True}]
        )
        created_children += 1
        print(f"   └── 🏷️ Created Child: '{child['name']}' (ID: {child_id}) -> Parent: {root_id}")

print(f"\n--- STEP 3: VERIFICATION ---")
print(f"Total Roots Created: {created_roots} (Expected: 4)")
print(f"Total Children Created: {created_children} (Expected: 10)")

all_cats = models.execute_kw(
    db, uid, password, 'res.partner.category', 'search_read',
    [[['active', '=', True]]],
    {'fields': ['id', 'name', 'parent_id', 'display_name', 'color'], 'order': 'name asc'}
)

print(f"\nTotal Active Categories in Odoo 18: {len(all_cats)}")
for c in all_cats:
    if any(c['name'].startswith(p) for p in prefixes):
        parent_label = c['parent_id'][1] if c['parent_id'] else '[ROOT]'
        print(f"  [{c['id']:2d}] {c['name']:<35} | Parent: {parent_label:<32} | Color: {c['color']}")

