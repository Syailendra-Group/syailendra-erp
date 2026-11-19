# -*- coding: utf-8 -*-
from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    requires_qc_release = fields.Boolean(
        string='Wajib Rilis QC',
        help='Lot produk ini harus berstatus Approved (CoA terbit) sebelum '
             'boleh dikirim ke pelanggan.',
    )

    # Structured essential-oil metadata. The former free-form carrier was the translated
    # `description` column (JSONB in Odoo 18), which cannot be filtered or searched as data.
    atsiri_metadata = fields.Json(
        string='Metadata Atsiri',
        help='Metadata terstruktur produk atsiri: CAS, EINECS, FEMA, HS Code, nama botani, '
             'famili, INCI, bagian tanaman, metode ekstraksi, aroma, umur simpan, dan '
             'spesifikasi QC (SG / RI / OR / GC-MS).',
    )
    atsiri_category = fields.Selection(
        selection=[
            ('essential_oils', 'Essential Oils'),
            ('natural_isolates', 'Natural Isolates'),
            ('carrier_oils', 'Carrier Oils'),
            ('hydrosols', 'Hydrosols'),
            ('raw_biomass', 'Raw Biomass'),
            ('packaging', 'Packaging'),
        ],
        string='Kategori Atsiri',
        index=True,
        help='Kategori bisnis produk atsiri; dipakai sebagai filter katalog.',
    )
