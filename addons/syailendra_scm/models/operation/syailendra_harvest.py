# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError


class SyailendraHarvest(models.Model):
    """Sesi panen lapangan yang mengonsolidasikan hasil petik satu blok kebun."""

    _name = 'syailendra.harvest'
    _description = 'Sesi Panen Lapangan'
    _order = 'harvest_date desc, id desc'

    name = fields.Char(
        string='Nomor Lot Panen',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'syailendra.harvest'
        ),
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Mitra Pemasok',
        required=True,
        index=True,
        domain="[('supplier_rank', '>', 0)]",
    )
    farm_id = fields.Many2one(
        'syailendra.farm',
        string='Kebun Asal',
        required=True,
        index=True,
        domain="[('partner_id', '=', partner_id)]",
    )
    crop_id = fields.Many2one(
        'syailendra.crop', string='Komoditas', required=True, index=True
    )

    harvest_date = fields.Date(
        string='Tanggal Panen',
        required=True,
        default=fields.Date.context_today,
        index=True,
    )
    wet_weight_kg = fields.Float(string='Bobot Basah (Kg)', digits=(16, 2), required=True)
    initial_moisture_pct = fields.Float(string='Kadar Air Awal (%)', digits=(5, 2))
    harvest_condition = fields.Selection(
        [
            ('fresh', 'Segar Baru Petik'),
            ('pre_dried', 'Layur / Pra-Kering'),
            ('dried', 'Kering Total'),
        ],
        string='Kondisi Bahan',
        required=True,
        default='fresh',
    )
    quality_notes = fields.Text(string='Catatan Mutu Fisik')
    operator_name = fields.Char(string='Petugas Lapangan')

    state = fields.Selection(
        [
            ('draft', 'Tercatat'),
            ('delivered', 'Diserahkan ke Penyulingan'),
            ('cancelled', 'Dibatalkan'),
        ],
        string='Status',
        default='draft',
        required=True,
        index=True,
    )
    distillation_ids = fields.One2many(
        'syailendra.distillation', 'harvest_id', string='Batch Penyulingan'
    )
    distillation_count = fields.Integer(
        string='Jumlah Batch Suling', compute='_compute_distillation_count'
    )

    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    @api.depends('distillation_ids')
    def _compute_distillation_count(self):
        for record in self:
            record.distillation_count = len(record.distillation_ids)

    @api.constrains('wet_weight_kg')
    def _check_weight(self):
        for record in self:
            if record.wet_weight_kg <= 0:
                raise ValidationError('Bobot panen basah harus lebih besar dari 0 Kg.')

    @api.constrains('initial_moisture_pct')
    def _check_moisture(self):
        for record in self:
            if record.initial_moisture_pct and not 0 <= record.initial_moisture_pct <= 100:
                raise ValidationError('Kadar air awal harus 0-100 persen.')

    @api.constrains('partner_id', 'farm_id')
    def _check_farm_owner(self):
        for record in self:
            if record.farm_id and record.farm_id.partner_id != record.partner_id:
                raise ValidationError(
                    'Kebun asal tidak dimiliki oleh mitra pemasok yang dipilih.'
                )

    def action_mark_delivered(self):
        """Tandai lot panen telah diserahkan ke unit penyulingan."""
        self.write({'state': 'delivered'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})
