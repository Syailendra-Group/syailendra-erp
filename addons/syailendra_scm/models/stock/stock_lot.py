# -*- coding: utf-8 -*-
from odoo import api, fields, models


class StockLot(models.Model):
    """Ekstensi lot/batch menjadi simpul ketertelusuran hulu-hilir."""

    _inherit = 'stock.lot'

    harvest_id = fields.Many2one(
        'syailendra.harvest', string='Lot Panen Asal', index=True
    )
    distillation_id = fields.Many2one(
        'syailendra.distillation', string='Batch Penyulingan Asal', index=True
    )
    distillery_id = fields.Many2one(
        'syailendra.distillery', string='Unit Ketel'
    )
    farmer_id = fields.Many2one('res.partner', string='Petani Mitra', index=True)
    farm_id = fields.Many2one('syailendra.farm', string='Kebun Asal', index=True)

    quarantine_state = fields.Selection(
        [
            ('quarantine', 'Karantina'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        string='Status Karantina Mutu',
        default='quarantine',
        index=True,
    )
    coa_number = fields.Char(string='Nomor CoA')
    active_compound_pct = fields.Float(
        string='Senyawa Aktif GC-MS (%)', digits=(5, 2)
    )
    specific_gravity = fields.Float(string='Berat Jenis (20°C)', digits=(6, 4))
    refractive_index = fields.Float(string='Indeks Bias (20°C)', digits=(6, 4))

    traceability_complete = fields.Boolean(
        string='Silsilah Lengkap',
        compute='_compute_traceability_complete',
        store=True,
        help='Bernilai benar bila kebun, petani, dan batch penyulingan tercatat.',
    )

    @api.depends('farm_id', 'farmer_id', 'distillation_id')
    def _compute_traceability_complete(self):
        for lot in self:
            lot.traceability_complete = bool(
                lot.farm_id and lot.farmer_id and lot.distillation_id
            )
