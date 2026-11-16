# -*- coding: utf-8 -*-
from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    requires_qc_release = fields.Boolean(
        string='Wajib Rilis QC',
        help='Lot produk ini harus berstatus Approved (CoA terbit) sebelum '
             'boleh dikirim ke pelanggan.',
    )
