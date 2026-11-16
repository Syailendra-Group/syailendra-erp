#!/usr/bin/env python3
"""
plan_suppliers.py — Read-only master-data planner for ERP Syailendra Group SCM pillar.

Reads the local XLSX snapshot (scripts/daftar-pemasok.xlsx) exported from Accurate Online
and prints a JSONL action plan of what WOULD be written to Odoo `res.partner`.

GUARANTEES (enforced in code):
  * Zero network calls.
  * Zero Odoo writes — there is no XML-RPC/JSON-RPC client in this file.
  * Credentials never touched; this script does not read .env at all.
  * Default mode is report-only; nothing is persisted outside stdout/stderr.

Output:
  * stdout : one JSON object per supplier row (JSONL)
  * stderr : human-readable summary
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter
from dataclasses import asdict, dataclass, field
from typing import Any

NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
XLSX_PATH = "/opt/octa/workspace/erp-syailendra/scripts/daftar-pemasok.xlsx"

# Expected Accurate Online vendor export columns (from sheet header row).
HEADER_ALIASES = {
    "No.": "no",
    "Kategori": "category",
    "ID Pemasok": "supplier_id",
    "Nama": "name",
    "Kontak": "contact_person",
    "No. Telp. Bisnis": "phone_office",
    "Handphone": "phone_mobile",
    "Email": "email",
    "Faximili": "fax",
    "Website": "website",
    "Mata Uang Utama": "currency",
    "Syarat Pembayaran": "payment_terms",
    "Alamat Pembayaran": "street",
    "Kota": "city",
    "Provinsi": "province",
    "Negara": "country",
    "Kode Pos": "zip",
    "NPWP": "npwp",
    "NIK": "nik",
    "Nama Wajib Pajak": "tax_name",
    "NPPKP": "nppkp",
    "Tipe Pemasok": "vendor_type",
}


def cell_text(cell_el) -> str:
    """Extract text from an XLSX cell: inlineStr (<is><t>) or shared string (<v> index)."""
    inline = cell_el.find(f".//{{{NS}}}is//{{{NS}}}t")
    if inline is not None and inline.text:
        return inline.text
    v = cell_el.find(f"{{{NS}}}v")
    if v is not None and v.text:
        return v.text
    return ""


def read_rows(path: str) -> list[list[str]]:
    with zipfile.ZipFile(path) as zf:
        sheet = zf.read("xl/worksheets/sheet1.xml")
        try:
            shared_xml = zf.read("xl/sharedStrings.xml")
        except KeyError:
            shared_xml = b""
    root = ET.fromstring(sheet)
    shared: list[str] = []
    if shared_xml:
        sroot = ET.fromstring(shared_xml)
        for si in sroot.findall(f".//{{{NS}}}si"):
            shared.append("".join(e.text or "" for e in si.findall(f".//{{{NS}}}t")))
    rows: list[list[str]] = []
    for row in root.findall(f".//{{{NS}}}row"):
        cells: list[str] = []
        for c in row.findall(f"{{{NS}}}c"):
            ctype = c.get("t")
            v = cell_text(c)
            if ctype == "s" and v.isdigit() and int(v) < len(shared):
                cells.append(shared[int(v)])
            else:
                cells.append(v)
        rows.append(cells)
    return rows


def normalize_phone(value: str) -> str | None:
    if not value:
        return None
    digits = re.sub(r"[^\d+]", "", value)
    if not digits:
        return None
    if digits.startswith("0") and not digits.startswith("+62"):
        digits = "+62" + digits[1:]
    elif not digits.startswith("+"):
        digits = "+62" + digits
    return digits


def categorize(raw_category: str) -> dict[str, str | bool]:
    """Map Accurate vendor category to Odoo partner attributes (plan only)."""
    cat = (raw_category or "").strip()
    upper = cat.upper()
    is_company = False
    odoo_category = None
    if upper.startswith("1.1") or "PERORANGAN_PETANI" in upper:
        odoo_category = "1.1 Perorangan Petani"
        is_company = False
    elif upper.startswith("1.2") or "PERORANGAN_PENYULING" in upper:
        odoo_category = "1.2 Perorangan Penyuling"
        is_company = False
    elif upper.startswith("1.3"):
        odoo_category = "1.3 Kelompok Petani/Penyuling"
        is_company = True
    elif upper.startswith("1.4"):
        odoo_category = "1.4 Koperasi Tani"
        is_company = True
    elif upper.startswith("1.5"):
        odoo_category = "1.5 BUMN/BUMD/BUMDES"
        is_company = True
    elif upper.startswith("1.6") or upper == "PERUSAHAAN":
        odoo_category = "1.6 Perusahaan"
        is_company = True
    elif upper.startswith("2.1"):
        odoo_category = "2.1 Perorangan Eksporir"
        is_company = False
    elif upper.startswith("2.2"):
        odoo_category = "2.2 Perusahaan Eksporir"
        is_company = True
    elif upper == "COMPANY":
        odoo_category = "Company"
        is_company = True
    elif upper == "GOVERNMENT":
        odoo_category = "Government"
        is_company = True
    elif upper == "INDIVIDUAL":
        odoo_category = "Individual"
        is_company = False
    elif cat.startswith("0"):
        # Legacy/sample categories without an Odoo mapping yet.
        odoo_category = f"UNMAPPED: {cat}"
        is_company = True
    elif cat:
        odoo_category = f"UNMAPPED: {cat}"
        is_company = True
    return {"odoo_category": odoo_category, "is_company": is_company, "raw_category": cat}


@dataclass
class PlanRecord:
    row_no: int
    supplier_id: str
    name: str
    action: str = "upsert"
    odoo_model: str = "res.partner"
    legacy_code: str = ""
    planned_category: str | None = None
    payload: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)


def build_record(row_no: int, rec: dict[str, str]) -> PlanRecord:
    supplier_id = (rec.get("supplier_id") or "").strip() or f"UNKNOWN-{row_no}"
    name = (rec.get("name") or "").strip() or f"Supplier {supplier_id}"
    legacy_code = f"FMR-{supplier_id}"
    cat = categorize(rec.get("category", ""))

    phone = normalize_phone(rec.get("phone_mobile") or "") or normalize_phone(
        rec.get("phone_office") or ""
    )
    street = rec.get("street") or ""
    city = rec.get("city") or ""
    address = ", ".join(p for p in [street, city] if p).strip() or None

    warnings: list[str] = []
    if not rec.get("email"):
        warnings.append("missing_email")
    if not phone:
        warnings.append("missing_phone")
    if not address:
        warnings.append("missing_address")
    if not rec.get("npwp") and not rec.get("nik"):
        warnings.append("missing_tax_id")

    payload: dict[str, Any] = {
        "name": name,
        "ref": legacy_code,
        "supplier_rank": 1,
        "customer_rank": 0,
        "is_company": cat["is_company"],
        "phone": phone,
        "email": rec.get("email") or None,
        "street": address,
        "comment": (
            f"Accurate ID: {supplier_id} | "
            f"Kategori: {cat['raw_category'] or '-'} | "
            f"NPWP: {rec.get('npwp') or '-'} | "
            f"NIK: {rec.get('nik') or '-'} | "
            f"Source: daftar-pemasok.xlsx (Accurate Online export)"
        ),
    }
    return PlanRecord(
        row_no=row_no,
        supplier_id=supplier_id,
        name=name,
        legacy_code=legacy_code,
        planned_category=cat["odoo_category"],
        payload=payload,
        warnings=warnings,
    )


def main() -> int:
    rows = read_rows(XLSX_PATH)
    if not rows:
        print(json.dumps({"error": "empty_workbook"}), file=sys.stderr)
        return 2

    # Locate header row: first cell equals "No."
    header_idx = None
    for i, row in enumerate(rows):
        if row and row[0].strip() == "No.":
            header_idx = i
            break
    if header_idx is None:
        print(json.dumps({"error": "header_row_not_found"}), file=sys.stderr)
        return 2

    raw_header = [h.strip() for h in rows[header_idx]]
    colmap: dict[str, int] = {}
    for idx, h in enumerate(raw_header):
        if h in HEADER_ALIASES:
            colmap[HEADER_ALIASES[h]] = idx

    def get(rec_index: int, alias: str) -> str:
        col = colmap.get(alias)
        if col is None or col >= len(rows[rec_index]):
            return ""
        return rows[rec_index][col].strip()

    seen_ids: set[str] = set()
    plan: list[PlanRecord] = []
    category_counter: Counter[str] = Counter()

    for i in range(header_idx + 1, len(rows)):
        row = rows[i]
        if not any(cell.strip() for cell in row):
            continue
        rec: dict[str, str] = {}
        for alias in HEADER_ALIASES.values():
            rec[alias] = get(i, alias)
        if not rec["name"] and not rec["supplier_id"]:
            continue
        supplier_id = rec["supplier_id"]
        if supplier_id in seen_ids:
            plan.append(
                PlanRecord(
                    row_no=i + 1,
                    supplier_id=supplier_id,
                    name=rec["name"],
                    action="skip",
                    reason="duplicate_supplier_id",
                    warnings=["duplicate_in_source"],
                )
            )
            continue
        seen_ids.add(supplier_id)
        category_counter[rec["category"]] += 1
        plan.append(build_record(i + 1, rec))

    for rec in plan:
        print(json.dumps(asdict(rec), ensure_ascii=False))

    print(f"# PLAN SUMMARY (read-only, 0 writes to Odoo)", file=sys.stderr)
    print(f"  source             : {XLSX_PATH}", file=sys.stderr)
    print(f"  header row         : line {header_idx + 1}", file=sys.stderr)
    print(f"  data rows scanned  : {sum(1 for r in rows[header_idx + 1:] if any(c.strip() for c in r))}", file=sys.stderr)
    print(f"  unique suppliers   : {len(seen_ids)}", file=sys.stderr)
    print(f"  planned upserts    : {sum(1 for r in plan if r.action == 'upsert')}", file=sys.stderr)
    print(f"  duplicates skipped : {sum(1 for r in plan if r.action == 'skip')}", file=sys.stderr)
    print(f"  with warnings      : {sum(1 for r in plan if r.warnings)}", file=sys.stderr)
    print(f"  mode               : report-only (no Odoo client, no network)", file=sys.stderr)
    print(f"  top categories     : {category_counter.most_common(6)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
