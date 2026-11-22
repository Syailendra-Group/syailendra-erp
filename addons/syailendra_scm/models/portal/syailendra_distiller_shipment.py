# -*- coding: utf-8 -*-
"""Distiller shipment notice to PT SBI (section F of ALUR PRODUCTION_TRACEBILITY)."""
from odoo import _, api, fields, models
from odoo.exceptions import AccessError, UserError, ValidationError

CONDITION_SELECTION = [
    ('good', 'Baik / Segel Utuh'),
    ('damaged', 'Kemasan Rusak'),
    ('leaking', 'Bocor'),
    ('other', 'Lainnya'),
]

STATE_SELECTION = [
    ('draft', 'Tercatat'),
    ('in_transit', 'Dalam Pengiriman'),
    ('received', 'Diterima PT SBI'),
    ('cancelled', 'Dibatalkan'),
]


class SyailendraDistillerShipment(models.Model):
    """One delivery of oil from a distiller to the company warehouse."""

    _name = 'syailendra.distiller.shipment'
    _description = 'Pengiriman Minyak Penyuling ke PT SBI'
    _order = 'shipment_date desc, id desc'

    name = fields.Char(
        string='Nomor Pengiriman', required=True, copy=False, readonly=True, index=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('syailendra.distiller.shipment'),
    )
    submission_id = fields.Many2one(
        'syailendra.partner.submission', string='Laporan Asal', ondelete='set null', index=True,
    )
    distillation_id = fields.Many2one(
        'syailendra.distillation', string='Batch Penyulingan', required=True, index=True,
        ondelete='restrict',
    )
    # Derived from the distillation, never user input. required=True on a stored
    # related field makes the INSERT fail with a NOT NULL violation before Odoo
    # computes the value, so the column must stay nullable.
    partner_id = fields.Many2one(
        'res.partner', string='Penyuling', index=True,
        related='distillation_id.partner_id', store=True,
    )
    product_id = fields.Many2one('product.product', string='Jenis Minyak', required=True)
    po_reference = fields.Char(string='Nomor PO PT SBI', index=True)
    shipment_date = fields.Date(string='Tanggal Kirim', required=True, index=True)
    quantity_kg = fields.Float(string='Jumlah Dikirim (Kg)', digits=(16, 3))
    quantity_liter = fields.Float(string='Jumlah Dikirim (Liter)', digits=(16, 3))
    package_count = fields.Integer(string='Jumlah Kemasan')
    package_code = fields.Char(string='Identitas Kemasan')
    package_type = fields.Char(string='Jenis Kemasan')
    vehicle = fields.Char(string='Kendaraan / Pengangkut')
    condition = fields.Selection(CONDITION_SELECTION, string='Kondisi Pengiriman', default='good')
    received_at_sbi_date = fields.Date(string='Tanggal Diterima PT SBI')
    notes = fields.Text(string='Catatan')
    state = fields.Selection(STATE_SELECTION, string='Status', default='draft', required=True, index=True)
    company_id = fields.Many2one(
        'res.company', string='Perusahaan', required=True, index=True,
        default=lambda self: self.env.company,
    )

    def _require_manager(self):
        if not self.env.su and not self.env.user.has_group('syailendra_scm.group_scm_manager'):
            raise AccessError(_('Hanya SCM Manager yang dapat mengubah status pengiriman.'))

    def action_send(self):
        """Mark the shipment as departed. Requires a shipment date."""
        self._require_manager()
        for record in self:
            if record.state != 'draft':
                raise UserError(_('Hanya pengiriman berstatus draf yang dapat dikirim.'))
            if not record.shipment_date:
                raise UserError(_('Tanggal kirim wajib diisi sebelum pengiriman dikirim.'))
            record.sudo().write({'state': 'in_transit'})
        return True

    def action_receive(self, received_date=None):
        """Confirm receipt at PT SBI. The receipt date may not precede departure."""
        self._require_manager()
        for record in self:
            if record.state != 'in_transit':
                raise UserError(_('Hanya pengiriman dalam perjalanan yang dapat diterima.'))
            received = fields.Date.to_date(received_date) if received_date else fields.Date.context_today(record)
            if record.shipment_date and received < record.shipment_date:
                raise UserError(_('Tanggal diterima tidak boleh mendahului tanggal kirim.'))
            record.sudo().write({'state': 'received', 'received_at_sbi_date': received})
        return True

    def action_cancel(self):
        """Cancel a shipment that has not been received yet."""
        self._require_manager()
        for record in self:
            if record.state == 'received':
                raise UserError(_('Pengiriman yang sudah diterima tidak dapat dibatalkan.'))
            if record.state == 'cancelled':
                raise UserError(_('Pengiriman sudah dibatalkan.'))
            record.sudo().write({'state': 'cancelled'})
        return True

    @api.constrains('quantity_kg', 'quantity_liter', 'package_count')
    def _check_quantities(self):
        for record in self:
            if record.quantity_kg < 0 or record.quantity_liter < 0 or record.package_count < 0:
                raise ValidationError(_('Kuantitas dan jumlah kemasan tidak boleh negatif.'))
            if not record.quantity_kg and not record.quantity_liter:
                raise ValidationError(_('Isi jumlah dikirim dalam kg atau liter.'))

    @api.constrains('shipment_date', 'received_at_sbi_date')
    def _check_dates(self):
        for record in self:
            if (record.received_at_sbi_date and record.shipment_date
                    and record.received_at_sbi_date < record.shipment_date):
                raise ValidationError(_('Tanggal diterima tidak boleh mendahului tanggal kirim.'))
