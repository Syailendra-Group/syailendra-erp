# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError


class SyailendraDistillation(models.Model):
    """Operasional ketel suling: konsumsi biomassa, parameter proses, dan rendemen."""

    _name = 'syailendra.distillation'
    _description = 'Batch Penyulingan'
    _order = 'distillation_date desc, id desc'

    name = fields.Char(
        string='Nomor Batch Suling',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'syailendra.distillation'
        ),
        index=True,
    )
    distillery_id = fields.Many2one(
        'syailendra.distillery',
        string='Unit Ketel',
        required=True,
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Penyuling',
        related='distillery_id.partner_id',
        store=True,
        index=True,
    )
    harvest_id = fields.Many2one(
        'syailendra.harvest',
        string='Lot Panen Input',
        required=True,
        index=True,
        domain="[('state', '=', 'delivered')]",
    )
    product_id = fields.Many2one(
        'product.product',
        string='Minyak Dihasilkan',
        required=True,
        index=True,
        domain="[('type', '!=', 'service')]",
    )

    distillation_date = fields.Date(
        string='Tanggal Penyulingan',
        required=True,
        default=fields.Date.context_today,
        index=True,
    )
    biomass_input_kg = fields.Float(
        string='Biomassa Masuk Ketel (Kg)', digits=(16, 2), required=True
    )
    crude_oil_output_kg = fields.Float(
        string='Minyak Mentah Dihasilkan (Kg)', digits=(16, 3)
    )
    hydrosol_output_liter = fields.Float(
        string='Hidrosol Dihasilkan (Liter)', digits=(16, 2)
    )
    yield_percent = fields.Float(
        string='Rendemen (%)',
        compute='_compute_yield_percent',
        store=True,
        aggregator='avg',
        digits=(6, 3),
    )
    duration_hours = fields.Float(string='Durasi Penyulingan (Jam)')
    peak_temp_c = fields.Float(string='Suhu Puncak (°C)')
    steam_pressure_bar = fields.Float(string='Tekanan Uap (Bar)')
    operator_name = fields.Char(string='Operator Ketel')
    sanitation_passed = fields.Boolean(string='Pemeriksaan Sanitasi Lolos', default=True)
    notes = fields.Text(string='Catatan Operasional')

    lot_id = fields.Many2one(
        'stock.lot',
        string='Lot Minyak Terbit',
        readonly=True,
        copy=False,
        help='Nomor lot yang diterbitkan otomatis saat batch dinyatakan selesai.',
    )
    lot_reference = fields.Char(
        string='Referensi Lot', related='lot_id.name', readonly=True
    )

    state = fields.Selection(
        [
            ('in_progress', 'Sedang Menyuling'),
            ('done', 'Selesai'),
            ('failed', 'Gagal'),
        ],
        string='Status Operasional',
        default='in_progress',
        required=True,
        index=True,
    )

    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    @api.depends('biomass_input_kg', 'crude_oil_output_kg')
    def _compute_yield_percent(self):
        for record in self:
            if record.biomass_input_kg and record.crude_oil_output_kg:
                record.yield_percent = (
                    record.crude_oil_output_kg / record.biomass_input_kg
                ) * 100.0
            else:
                record.yield_percent = 0.0

    @api.constrains('biomass_input_kg', 'crude_oil_output_kg')
    def _check_weights(self):
        for record in self:
            if record.biomass_input_kg <= 0:
                raise ValidationError('Input biomassa harus lebih besar dari 0 Kg.')
            if record.crude_oil_output_kg < 0:
                raise ValidationError('Hasil minyak mentah tidak boleh negatif.')
            if record.crude_oil_output_kg > record.biomass_input_kg:
                raise ValidationError(
                    'Hasil minyak mentah tidak boleh melebihi input biomassa.'
                )

    @api.constrains('yield_percent')
    def _check_yield(self):
        for record in self:
            if record.yield_percent and record.yield_percent > 100:
                raise ValidationError('Rendemen tidak boleh melebihi 100%.')
