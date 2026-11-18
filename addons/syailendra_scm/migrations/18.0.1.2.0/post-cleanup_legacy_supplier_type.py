# -*- coding: utf-8 -*-
"""Drop the legacy res_partner.supplier_type selection column.

The field was replaced by supplier_type_id (Many2one to syailendra.supplier.type).
Every value was NULL at migration time, and removing the field from the Python
model does not guarantee the column is dropped, so do it explicitly.
"""


def migrate(cr, version):
    if version is None:
        return
    cr.execute("ALTER TABLE res_partner DROP COLUMN IF EXISTS supplier_type")
