# Custom Odoo Addons Workflow & Regional Hierarchy Extension

## 1. Directory Structure & Volume Mounts
In Docker-based deployments (e.g. VPS), mount host custom addons directly into `/mnt/extra-addons`:

```text
/opt/octa/data/odoo/addons/<addon_name>/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   └── <feature>.py
└── security/
    └── ir.model.access.csv
```

## 2. Permissions & File Ownership
In Odoo 18 official Docker images, the daemon runs under UID `100:101` (`odoo:odoo`). Host files must match or grant read access:
```bash
chown -R 100:101 /opt/octa/data/odoo/addons/<addon_name>
chmod -R 755 /opt/octa/data/odoo/addons/<addon_name>
```

## 3. CLI Installation & Upgrading Inside Running Containers
When installing or upgrading an addon via CLI in a container where the Odoo server daemon is already running:
**Always pass `--no-http`** to prevent port collision (`[Errno 98] Address already in use` on port 8069):

```bash
docker exec odoo-web odoo -i <addon_name> -d <db_name> --no-http --stop-after-init
```

For upgrading an existing module:
```bash
docker exec odoo-web odoo -u <addon_name> -d <db_name> --no-http --stop-after-init
```

After CLI completion, restart the web container to reload the ORM registry in web workers:
```bash
docker restart odoo-web
```

## 4. Regional Hierarchy Models Pattern (`syailendra_region`)
Standard Odoo (`res.country`, `res.country.state`) stops at the province level. For agricultural and plantation traceability, extend the hierarchy:

1. **`res.country.city` (Kabupaten / Kota):**
   - Belongs to `res.country.state` with `ondelete='restrict'`.
   - Stores official BPS/Kemendagri code, alias, centroid latitude and longitude.
2. **`res.country.district` (Kecamatan):**
   - Belongs to `res.country.city` with `ondelete='restrict'`.
   - Related fields for `state_id` and `country_id` (stored for fast indexed queries).
3. **`res.country.subdistrict` (Kelurahan / Desa):**
   - Belongs to `res.country.district` with `ondelete='restrict'`.
   - Stores official postal code (`zip_code`), centroid coordinates.
4. **`res.partner` Extension:**
   - Adds `city_id`, `district_id`, `subdistrict_id`, and `address_detail` (Blok/RT/RW).

## 5. Portability & Migration to Company Odoo
Because custom addons are self-contained:
- To migrate to a company Odoo (self-hosted or Odoo.sh), simply copy the addon folder into the company repository's custom addons path and click **Install** in the Odoo Apps menu.
- Zero changes are required in the Next.js headless frontend, as all model names and JSON-RPC contracts remain identical.
