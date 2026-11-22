# -*- coding: utf-8 -*-
"""Backend fields required by the partner capture forms (SG-12).

Kept in one extension module so the whole SG-12 schema addition is reviewable and
reversible in a single place. Sources: Form-SBI-FMR-01, SOP-01/02, and
ALUR PRODUCTION_TRACEBILITY sections B/C/D.
"""
from odoo import _, api, fields, models
from odoo.exceptions import ValidationError

LAND_OWNERSHIP = [
    ('owned', 'Milik Sendiri'),
    ('rented', 'Sewa'),
    ('sharecropped', 'Bagi Hasil / Garap'),
    ('group', 'Milik Kelompok Tani'),
    ('other', 'Lainnya'),
]

DISTILLATION_METHOD = [
    ('steam', 'Steam Distillation'),
    ('water', 'Water Distillation'),
    ('water_steam', 'Water & Steam Distillation'),
    ('hydrodiffusion', 'Hydrodiffusion'),
    ('co2', 'Supercritical CO2'),
    ('cold_press', 'Cold Press'),
    ('solvent', 'Solvent Extraction'),
    ('enfleurage', 'Enfleurage'),
]

BIOMASS_CONDITION = [
    ('fresh', 'Segar'),
    ('wilted', 'Layu'),
    ('dried', 'Kering'),
    ('powder', 'Bubuk'),
    ('other', 'Lainnya'),
]


class ResPartnerCapture(models.Model):
    _inherit = 'res.partner'

    nik = fields.Char(
        string='NIK', size=16, copy=False,
        groups='syailendra_scm.group_scm_user',
        help='Nomor Induk Kependudukan (Form-SBI-FMR-01). Data pribadi, akses terbatas.',
    )

    @api.constrains('nik')
    def _check_nik(self):
        for partner in self:
            if partner.nik and (not partner.nik.isdigit() or len(partner.nik) != 16):
                raise ValidationError(_('NIK harus 16 digit angka.'))


class SyailendraFarmCapture(models.Model):
    _inherit = 'syailendra.farm'

    estimated_yield_kg = fields.Float(
        string='Estimasi Hasil Panen per Siklus (Kg)', digits=(16, 2),
        help='Est. Yield / Panen pada Form-SBI-FMR-01.',
    )
    land_ownership = fields.Selection(LAND_OWNERSHIP, string='Status Kepemilikan Lahan')


class SyailendraHarvestCapture(models.Model):
    _inherit = 'syailendra.harvest'

    planted_date = fields.Date(string='Tanggal Tanam')
    pretreatment = fields.Char(
        string='Perlakuan Bahan',
        help='Sortasi, pencucian, pencacahan, pengeringan — dipisahkan koma.',
    )
    origin_latitude = fields.Float(string='Latitude Asal Bahan', digits=(10, 7))
    origin_longitude = fields.Float(string='Longitude Asal Bahan', digits=(10, 7))
    source_farmer_name = fields.Char(
        string='Nama Petani / Pemasok Asal',
        help='Diisi penyuling bila petani asal belum terdaftar sebagai mitra.',
    )
    plant_part = fields.Selection(
        related='crop_id.plant_part', string='Bagian Tanaman', store=True, readonly=True,
    )
    received_at_distillery_date = fields.Date(string='Tanggal Diterima Penyuling')
    handover_weight_kg = fields.Float(string='Berat Serah Terima (Kg)', digits=(16, 2))
    handover_partner_id = fields.Many2one(
        'res.partner', string='Diserahkan Kepada', domain="[('supplier_rank', '>', 0)]",
    )

    @api.constrains('planted_date', 'harvest_date')
    def _check_planted_before_harvest(self):
        for record in self:
            if record.planted_date and record.harvest_date and record.planted_date > record.harvest_date:
                raise ValidationError(_('Tanggal tanam tidak boleh setelah tanggal panen.'))

    @api.constrains('handover_weight_kg')
    def _check_handover_weight(self):
        for record in self:
            if record.handover_weight_kg < 0:
                raise ValidationError(_('Berat serah terima tidak boleh negatif.'))


class SyailendraDistilleryCapture(models.Model):
    _inherit = 'syailendra.distillery'

    business_name = fields.Char(string='Nama Usaha / Kelompok')


class SyailendraDistillationCapture(models.Model):
    _inherit = 'syailendra.distillation'

    prep_start_at = fields.Datetime(string='Mulai Persiapan')
    distillation_start_at = fields.Datetime(string='Mulai Penyulingan')
    first_drop_at = fields.Datetime(string='Tetesan Pertama')
    end_at = fields.Datetime(string='Selesai Penyulingan')
    method = fields.Selection(DISTILLATION_METHOD, string='Metode Penyulingan')
    steam_water_temp_c = fields.Float(string='Suhu Air / Steam (C)', digits=(6, 2))
    cycles_count = fields.Integer(string='Jumlah Siklus', default=1)
    steam_source = fields.Char(string='Sumber Air / Steam')
    biomass_condition = fields.Selection(BIOMASS_CONDITION, string='Kondisi Bahan Masuk')
    oil_volume_liter = fields.Float(string='Volume Minyak (Liter)', digits=(16, 3))
    filtered_oil_kg = fields.Float(string='Minyak Setelah Penyaringan (Kg)', digits=(16, 3))
    packed_oil_kg = fields.Float(string='Minyak Dikemas (Kg)', digits=(16, 3))
    production_notes = fields.Text(string='Catatan Hasil Produksi')
    time_to_first_drop_min = fields.Float(
        string='Waktu ke Tetesan Pertama (menit)', compute='_compute_capture_metrics',
        store=True, digits=(16, 1),
    )
    packing_variance_kg = fields.Float(
        string='Selisih Hasil vs Dikemas (Kg)', compute='_compute_capture_metrics',
        store=True, digits=(16, 3),
    )

    @api.depends('distillation_start_at', 'first_drop_at', 'crude_oil_output_kg', 'packed_oil_kg')
    def _compute_capture_metrics(self):
        for record in self:
            if record.distillation_start_at and record.first_drop_at:
                delta = record.first_drop_at - record.distillation_start_at
                record.time_to_first_drop_min = round(delta.total_seconds() / 60.0, 1)
            else:
                record.time_to_first_drop_min = 0.0
            if record.packed_oil_kg:
                record.packing_variance_kg = round(record.crude_oil_output_kg - record.packed_oil_kg, 3)
            else:
                record.packing_variance_kg = 0.0

    @api.constrains('prep_start_at', 'distillation_start_at', 'first_drop_at', 'end_at')
    def _check_process_order(self):
        for record in self:
            stamps = [
                record.prep_start_at, record.distillation_start_at,
                record.first_drop_at, record.end_at,
            ]
            present = [value for value in stamps if value]
            if present != sorted(present):
                raise ValidationError(_(
                    'Urutan waktu harus: persiapan, mulai suling, tetesan pertama, selesai.'
                ))

    @api.constrains('cycles_count', 'steam_water_temp_c')
    def _check_process_numbers(self):
        for record in self:
            if record.cycles_count < 0:
                raise ValidationError(_('Jumlah siklus tidak boleh negatif.'))
            if record.steam_water_temp_c < 0:
                raise ValidationError(_('Suhu air/steam tidak boleh negatif.'))
