---
name: odoo-model-extension
description: "Use when extending Odoo models with custom fields or addons."
version: 1.0.0
author: "Kael (octadev)"
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags:
      - odoo-18
      - model-extension
      - custom-addons
      - schema-evolution
      - headless-erp
      - postgresql
      - json-rpc
---

# Odoo Model Extension & Custom Addon Architecture

Engineering guide for extending core Odoo ERP models (`res.partner`, `product.template`, `stock.lot`, etc.) with clean native columns via custom addons, avoiding free-text overloading, and integrating seamlessly with headless TypeScript services.

## When to Use

- Adding domain-specific fields or attributes that do not exist in standard Odoo models.
- Upgrading and maintaining custom addons in running Docker environments.
- Decoupling structured domain attributes from free-text `comment` or `note` fields.
- Ensuring zero concatenation loops and zero HTML tag pollution in backend models.
- Synchronizing headless Next.js frontend services with extended Odoo ORM schemas.

---

## Core Engineering Principles

### 1. Zero Free-Text Field Overloading (The Anti-Concatenation Invariant)
- **Anti-Pattern:** Storing structured metadata (e.g. `Komoditas: Cengkeh | Metode: Organic | Luas: 2500 m² | Patokan: Depan Balai Desa`) inside `comment`, `description`, or `note`.
  - *Failure Mode:* Consecutive edits re-read the previous formatted string and append new values, resulting in unbounded string repetition (*concatenation loop*), corrupted HTML tags (`<p>...</p>`), and impossible database indexing.
- **Rule:** Every domain attribute must be declared as a native field in a custom addon (`fields.Char`, `fields.Selection`, `fields.Float`, `fields.Integer`, `fields.Many2one`, etc.). Free-text fields like `comment` must strictly remain reserved for genuine user remarks.

### 2. Addon Placement & Volume Mapping
- Custom addons reside in host mount paths mapped to `/mnt/extra-addons` inside the container:
  ```text
  /opt/octa/data/odoo/addons/<addon_name>/
  ├── __init__.py
  ├── __manifest__.py
  ├── models/
  │   ├── __init__.py
  │   └── <entity>.py
  └── security/
      └── ir.model.access.csv
  ```
- File permissions must match container daemon UID `100:101` (`chown -R 100:101 <addon_path>` and `chmod -R 755 <addon_path>`).

---

## Step-by-Step Procedure: Extending a Model

### Step 1: Declare Extended Fields in Python Model
Inherit the target model using `_inherit` without changing `_name` to preserve existing table identities:

```python
# -*- coding: utf-8 -*-
from odoo import models, fields

class ResPartner(models.Model):
    _inherit = 'res.partner'

    # Domain attributes with explicit types & defaults
    address_benchmark = fields.Char(string='Address Benchmark / Landmark')
    commodity = fields.Selection([
        ('cengkeh', 'Cengkeh'),
        ('nilam', 'Nilam'),
        ('serai', 'Serai Wangi'),
        ('pala', 'Pala'),
        ('gaharu', 'Gaharu'),
        ('kopi', 'Kopi')
    ], string='Main Commodity', default='cengkeh')
    farming_method = fields.Selection([
        ('organic', 'Organic'),
        ('conventional', 'Conventional')
    ], string='Farming Method', default='organic')
    land_area_m2 = fields.Float(string='Land Area (m²)')
    legacy_code = fields.Char(string='Accurate Legacy Code', index=True)
```

### Step 2: In-Container CLI Addon Upgrade
Run the upgrade through the `server` dispatcher on a throwaway HTTP port; a bare
`odoo -c ... -u <addon>` can exit 0 while only loading the registry, leaving the module
version unchanged.

```bash
# 1. Upgrade in place (separate port avoids [Errno 98] against the live web process)
docker exec <odoo_container> odoo server -c /etc/odoo/odoo.conf -d <dbname> \
  -u <addon_name> --http-port=8079 --stop-after-init --log-level=info

# 2. Restart the container so the web worker reloads the ORM registry
docker restart <odoo_container>

# 3. Prove it ran — exit code alone does not
#    SELECT latest_version FROM ir_module_module WHERE name='<addon_name>';
#    + information_schema.columns for every new/dropped column
```

### Step 3: Verify Schema in PostgreSQL
Audit PostgreSQL directly via container CLI to confirm that columns were successfully generated with expected data types:

```bash
docker exec -i odoo-db psql -U odoo -d <dbname> -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = '<table_name>' AND column_name IN ('address_benchmark', 'commodity', 'land_area_m2');
"
```

### Step 4: Headless Service Layer Synchronization
1. **Extend Read Fields:** Add the new native column names to the service constant (e.g. `FARMER_READ_FIELDS`).
2. **Direct Mapping:** Map database columns directly in `mapPartnerToFarmer`, with fallback parsing only for legacy records during transition.
3. **Clean Payload Construction:** In `persistFarmer` / save functions, assign native fields directly to `payload`. Strip HTML tags (`<[^>]+>`) from `comment` and never serialize structured metadata into user remarks.

---

## Common Pitfalls & How to Avoid

| Pitfall | Root Cause | Solution |
| :--- | :--- | :--- |
| **`[Errno 98] Address already in use`** | CLI upgrade tries to bind the live web port | Use the `server` dispatcher with `--http-port=<free port> --stop-after-init`, then restart the container. |
| **Upgrade exits 0 but nothing changed** | Bare `odoo -u <addon>` loaded the registry without upgrading | Always invoke `odoo server ... -u <addon>`; verify `ir_module_module.latest_version` and the expected columns afterwards. |
| **Removing a field breaks the headless client** | The upgrade drops the column while the running frontend still reads it | Remove the field from the client's type, raw interface, mapper, `*_FIELDS` list, schema, form, columns, dialogs/detail and both locale files, deploy that build first, then upgrade the addon. |
| **`PermissionError: [Errno 13]`** | File owned by root or wrong UID | Enforce `chown -R 100:101` for Odoo 18 containers. |
| **Missing Column in DB after Upgrade** | Python model file not imported in `models/__init__.py` or module not updated | Ensure `from . import <entity>` exists in `models/__init__.py` and manifest version bumped. |
| **Concatenation Loop in Notes** | Re-serializing metadata into `comment` on update | Store metadata in native fields; only save sanitized manual notes in `comment`. |
| **Field Not Visible over JSON-RPC** | Field not included in client `fields` array or missing access rights | Add field to `*_READ_FIELDS` array and verify `ir.model.access.csv` covers the model. |
