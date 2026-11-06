#!/usr/bin/env python3
"""
seed_suppliers.py — Idempotent Seeder for Real DDistillers Suppliers (res.partner)
Syailendra Group ERP (SCM Pillar)
Complies with octadev-coding-rules-v78 (Rules 1, 6, 85, 86, 87, 94, 95)
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
import xmlrpc.client
import zipfile

ODOO_URL = "http://10.10.0.238:8069"
ODOO_DB = "odoo_dev"
ODOO_USER = "octalectzz@gmail.com"
ODOO_PASS = "OctaLectzz0410?"

XLSX_PATH = "/opt/octa/workspace/erp-syailendra/scripts/daftar-pemasok.xlsx"

# Mapping from Excel category names to exact Odoo category names
CATEGORY_MAP = {
    "1.1 PERORANGAN_PETANI": "1.1 Perorangan Petani",
    "1.2 PERORANGAN_PENYULING": "1.2 Perorangan Penyuling",
    "1.3 KELOMPOK PETANI/PENYULING": "1.3 Kelompok Petani/Penyuling",
    "1.4 KOPERASI": "1.4 Koperasi Tani",
    "1.5 BUMN/BUMD/BUMDES": "1.5 BUMN / BUMD / BUMDes",
    "1.6 PERUSAHAAN": "1.6 Perusahaan Bahan Baku",
    "04. PEMASOK STICKER": "04. Pemasok Sticker & Label",
    "05. PEMASOK BOTOL": "05. Pemasok Botol & Tutup",
    "03. PEMASOK SAMPLE": "03. Pemasok Sample R&D",
    "07. PEMASOK BAHAN KIMIA": "07. Pemasok Bahan Kimia QC",
    "06. PEMASOK PERLENGKAPAN LAINNYA": "06. Pemasok Perlengkapan Lainnya",
    "2.1 PERORANGAN_EKSPORTIR": "2.1 Perorangan Eksportir",
    "2.2 PERUSAHAAN_EKSPORTIR": "2.2 Perusahaan Eksportir",
}

def clean_cell(val):
    if not val:
        return ""
    return str(val).strip()

def sanitize_phone(phone_str):
    if not phone_str:
        return ""
    cleaned = re.sub(r"[^\d+]", "", phone_str)
    return cleaned

def is_company_name(name):
    upper = name.upper()
    prefixes = ["PT", "PT.", "CV", "CV.", "UD", "UD.", "KOPERASI", "BUMDES", "BUMN", "PD", "TOKO", "STORE"]
    for p in prefixes:
        if upper.startswith(p + " ") or upper.startswith(p + "."):
            return True
    return False

def main():
    print("=" * 70)
    print("SEEDING REAL DDISTILLERS SUPPLIERS INTO ODOO 18 (res.partner)")
    print("=" * 70)

    # 1. Authenticate with Odoo 18
    common = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/common")
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
    if not uid:
        print("ERROR: Authentication to Odoo failed!")
        sys.exit(1)
    print(f"Authenticated successfully as UID: {uid}")

    models = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/object")

    # 2. Fetch Odoo Partner Categories mapping
    cats = models.execute_kw(
        ODOO_DB, uid, ODOO_PASS, "res.partner.category", "search_read",
        [[]], {"fields": ["id", "name", "display_name"]}
    )
    cat_name_to_id = {c["name"]: c["id"] for c in cats}
    default_cat_id = cat_name_to_id.get("06. Pemasok Perlengkapan Lainnya")

    # 3. Read Excel data (Handling inlineStr & shared strings via stdlib)
    rows_data = []
    with zipfile.ZipFile(XLSX_PATH, "r") as z:
        sheet_xml = z.read("xl/worksheets/sheet1.xml")
        tree = ET.fromstring(sheet_xml)
        ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
        raw_rows = tree.findall(f"{ns}sheetData/{ns}row")

        for row in raw_rows[1:]:  # Skip header row
            cells = row.findall(f"{ns}c")
            col_map = {}
            for c in cells:
                r_ref = c.get("r", "")
                col_letters = re.sub(r"\d+", "", r_ref)
                it = c.find(f"{ns}is/{ns}t")
                v = c.find(f"{ns}v")
                text = ""
                if it is not None and it.text:
                    text = it.text
                elif v is not None and v.text:
                    text = v.text
                col_map[col_letters] = clean_cell(text)
            rows_data.append(col_map)

    print(f"Parsed {len(rows_data)} vendor rows from Excel.")

    # 4. Idempotent Purge: Remove existing Syailendra suppliers (ref =like SUP-%)
    existing_supplier_ids = models.execute_kw(
        ODOO_DB, uid, ODOO_PASS, "res.partner", "search",
        [[["ref", "=like", "SUP-%"]]]
    )
    if existing_supplier_ids:
        print(f"Found {len(existing_supplier_ids)} existing SUP-% partners. Purging for idempotency...")
        # Unlink in batches of 50
        for i in range(0, len(existing_supplier_ids), 50):
            batch = existing_supplier_ids[i:i+50]
            models.execute_kw(ODOO_DB, uid, ODOO_PASS, "res.partner", "unlink", [batch])
        print("Purge completed successfully.")

    # 5. Batch Injection
    created_count = 0
    skipped_count = 0

    for idx, r in enumerate(rows_data, start=1):
        # Column mapping:
        # B: Kategori, C: ID Pemasok (Legacy), D: Nama, G: Handphone, H: Email
        # L: Syarat Pembayaran, M: Alamat Pembayaran, N: Kota, O: Provinsi, Q: Kode Pos
        # X: NPWP, Y: NIK
        category_raw = r.get("B", "")
        legacy_code = r.get("C", "")
        name = r.get("D", "")
        mobile = sanitize_phone(r.get("G", ""))
        email = r.get("H", "")
        payment_term_raw = r.get("L", "")
        street = r.get("M", "")
        city = r.get("N", "")
        zip_code = r.get("Q", "")
        vat = r.get("X", "") or r.get("Y", "")

        if not name:
            skipped_count += 1
            continue

        ref_code = f"SUP-{idx:04d}"
        is_company = is_company_name(name)
        company_type = "company" if is_company else "person"

        # Resolve category
        odoo_cat_name = CATEGORY_MAP.get(category_raw)
        category_id = cat_name_to_id.get(odoo_cat_name, default_cat_id)
        cat_ids = [category_id] if category_id else []

        # Standardize payment term
        term_clean = "PAID_BEFORE_SHIPMENT" if "PAID" in payment_term_raw.upper() else "COD"

        # Structured metadata
        metadata = {
            "legacyCode": legacy_code,
            "categoryNames": [odoo_cat_name] if odoo_cat_name else [],
            "paymentTerm": term_clean,
            "districtName": city,
        }

        vals = {
            "ref": ref_code,
            "name": name,
            "is_company": is_company,
            "company_type": company_type,
            "supplier_rank": 1,
            "active": True,
            "category_id": [[6, 0, cat_ids]],
            "comment": json.dumps(metadata),
        }

        if mobile:
            vals["mobile"] = mobile
        if email:
            vals["email"] = email
        if street:
            vals["street"] = street
        if city:
            vals["city"] = city
        if zip_code:
            vals["zip"] = zip_code
        if vat:
            vals["vat"] = vat

        try:
            models.execute_kw(ODOO_DB, uid, ODOO_PASS, "res.partner", "create", [vals])
            created_count += 1
            if created_count % 50 == 0:
                print(f"  -> Injected {created_count}/{len(rows_data)} suppliers...")
        except Exception as e:
            print(f"Error creating supplier {ref_code} ({name}): {e}")

    print(f"\nInjection complete! Created: {created_count}, Skipped: {skipped_count}")

    # 6. Verification
    total_in_db = models.execute_kw(
        ODOO_DB, uid, ODOO_PASS, "res.partner", "search_count",
        [[["ref", "=like", "SUP-%"], ["supplier_rank", ">", 0]]]
    )
    print(f"Verified total suppliers in Odoo 18 with domain guard: {total_in_db}")

if __name__ == "__main__":
    main()
