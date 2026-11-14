# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import UserError, ValidationError


class SyailendraQcInspection(models.Model):
    """Pengujian laboratorium mutu bahan baku atsiri dan otorisasi rilis CoA."""

    _name = 'syailendra.qc.inspection'
    _description = 'Pengujian Mutu & QC Laboratorium'
    _order = 'test_date desc, id desc'

    name = fields.Char(
        string='Nomor Uji QC',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'syailendra.qc.inspection'
        ),
        index=True,
    )
    lot_id = fields.Many2one(
        'stock.lot', string='Lot Batch Minyak', required=True, index=True
    )
    product_id = fields.Many2one(
        'product.product',
        string='Produk',
        related='lot_id.product_id',
        store=True,
        readonly=True,
    )
    coa_number = fields.Char(string='Nomor CoA', copy=False)
    test_date = fields.Date(
        string='Tanggal Uji',
        required=True,
        default=fields.Date.context_today,
        index=True,
    )
    analyst_name = fields.Char(string='Analis QC')

    # --- Organoleptik & fisik dasar ---
    color = fields.Char(string='Warna')
    aroma = fields.Char(string='Aroma')
    appearance = fields.Char(string='Penampilan / Kejernihan')
    specific_gravity = fields.Float(string='Specific Gravity (20°C)', digits=(6, 4))
    refractive_index = fields.Float(string='Refractive Index (20°C)', digits=(6, 4))
    optical_rotation = fields.Float(string='Optical Rotation (°)', digits=(6, 2))
    moisture_pct = fields.Float(string='Kadar Air (%)', digits=(5, 3))
    acid_value = fields.Float(string='Acid Value', digits=(6, 2))
    peroxide_value = fields.Float(string='Peroxide Value', digits=(6, 2))
    ffa_pct = fields.Float(string='FFA (%)', digits=(5, 3))

    # --- GC-MS ---
    gcms_marker = fields.Char(
        string='Marker Senyawa Aktif',
        help='Senyawa penanda utama, contoh: Patchouli Alcohol.',
    )
    gcms_marker_pct = fields.Float(string='Kadar Marker (%)', digits=(5, 2))
    gcms_report = fields.Binary(string='Laporan GC-MS (PDF)', attachment=True)

    status = fields.Selection(
        [
            ('quarantine', 'Karantina'),
            ('approved', 'Approved'),
            ('hold', 'Hold'),
            ('rejected', 'Rejected'),
        ],
        string='Status Mutu',
        default='quarantine',
        required=True,
        index=True,
    )
    rejection_reason = fields.Text(string='Alasan Penolakan / Tindak Lanjut')

    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    @api.constrains('moisture_pct', 'ffa_pct', 'gcms_marker_pct')
    def _check_percentages(self):
        for record in self:
            for value, label in (
                (record.moisture_pct, 'Kadar air'),
                (record.ffa_pct, 'FFA'),
                (record.gcms_marker_pct, 'Kadar marker GC-MS'),
            ):
                if value and not 0 <= value <= 100:
                    raise ValidationError('%s harus berada pada rentang 0-100%%.' % label)

    def action_approve(self):
        """Rilis lot: status mutu approved dan lot keluar dari karantina."""
        for record in self:
            if not record.coa_number:
                raise UserError('Nomor CoA wajib diisi sebelum lot dirilis.')
            record.status = 'approved'
            record.lot_id.write(
                {
                    'quarantine_state': 'approved',
                    'coa_number': record.coa_number,
                    'specific_gravity': record.specific_gravity,
                    'refractive_index': record.refractive_index,
                    'active_compound_pct': record.gcms_marker_pct,
                }
            )

    def action_hold(self):
        self.write({'status': 'hold'})
        self.mapped('lot_id').write({'quarantine_state': 'quarantine'})

    def action_reject(self):
        for record in self:
            if not record.rejection_reason:
                raise UserError('Alasan penolakan wajib diisi.')
        self.write({'status': 'rejected'})
        self.mapped('lot_id').write({'quarantine_state': 'rejected'})
