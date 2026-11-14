# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError

DISTILLATION_METHODS = [
    ('steam', 'Steam Distillation'),
    ('water_dist', 'Water Distillation'),
    ('water_steam', 'Water & Steam Distillation'),
    ('hydrodiffusion', 'Hydrodiffusion'),
    ('co2', 'Supercritical CO2 Extraction'),
    ('cold_press', 'Cold Press'),
    ('solvent', 'Solvent Extraction'),
    ('enfleurage', 'Enfleurage'),
]

BOILER_MATERIALS = [
    ('stainless_316', 'Stainless Steel 316'),
    ('stainless_304', 'Stainless Steel 304'),
    ('copper', 'Tembaga (Copper)'),
    ('mild_steel', 'Mild Steel'),
    ('galvanized', 'Galvanis'),
]

FUEL_TYPES = [
    ('firewood', 'Kayu Bakar'),
    ('biomass', 'Biomassa'),
    ('lpg', 'Gas LPG'),
    ('solar', 'Solar / Diesel'),
    ('electric', 'Listrik'),
]


class SyailendraDistillery(models.Model):
    """Unit fasilitas penyulingan (ketel) milik mitra penyuling."""

    _name = 'syailendra.distillery'
    _description = 'Fasilitas Penyulingan'
    _order = 'partner_id, name'

    name = fields.Char(string='Nama Unit Penyulingan', required=True)
    code = fields.Char(
        string='Kode Unit Ketel',
        required=True,
        index=True,
        help='Format baku: DST-[WILAYAH]-[NO_URUT], contoh DST-JTG-001.',
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Penyuling / Pemilik',
        required=True,
        ondelete='cascade',
        index=True,
        domain="[('supplier_rank', '>', 0)]",
    )

    # --- Lokasi fasilitas ---
    state_id = fields.Many2one('res.country.state', string='Provinsi')
    city_id = fields.Many2one('res.country.city', string='Kabupaten / Kota')
    district_id = fields.Many2one('res.country.district', string='Kecamatan')
    subdistrict_id = fields.Many2one(
        'res.country.subdistrict', string='Desa / Kelurahan'
    )
    address_detail = fields.Text(string='Alamat Detail Fasilitas')
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))
    facility_area_m2 = fields.Float(string='Luas Penyulingan (m²)', digits=(16, 2))

    # --- Spesifikasi teknis ketel ---
    distillation_method = fields.Selection(
        DISTILLATION_METHODS,
        string='Jenis Penyulingan',
        required=True,
        default='steam',
    )
    boiler_count = fields.Integer(string='Jumlah Ketel', default=1)
    boiler_capacity_kg = fields.Float(
        string='Kapasitas Ketel (Kg)', digits=(16, 2)
    )
    boiler_material = fields.Selection(
        BOILER_MATERIALS,
        string='Material Ketel',
        required=True,
        default='stainless_304',
    )
    fuel_type = fields.Selection(
        FUEL_TYPES, string='Bahan Bakar', required=True, default='biomass'
    )
    avg_duration_hours = fields.Float(string='Lama Penyulingan Rata-rata (Jam)')
    operating_temp_c = fields.Float(string='Suhu Operasional (°C)')
    operating_pressure_bar = fields.Float(string='Tekanan Uap (Bar)')
    avg_yield_percent = fields.Float(
        string='Rendemen Rata-rata (%)',
        digits=(6, 3),
        help='Nilai acuan historis untuk evaluasi Efisiensi Batch Penyulingan.',
    )

    # --- Kapasitas produksi ---
    monthly_capacity_kg = fields.Float(string='Produksi per Bulan (Kg)')
    yearly_capacity_kg = fields.Float(string='Produksi per Tahun (Kg)')
    max_capacity_kg = fields.Float(string='Kapasitas Maksimum (Kg)')
    lead_time_days = fields.Integer(string='Lead Time (Hari)')
    moq_kg = fields.Float(string='MOQ (Kg)')

    photo_distillery = fields.Image(
        string='Foto Penyulingan', max_width=1920, max_height=1920
    )
    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    _sql_constraints = [
        (
            'syailendra_distillery_code_uniq',
            'unique(code, company_id)',
            'Kode unit penyulingan harus unik per perusahaan.',
        ),
    ]

    @api.constrains('boiler_count', 'boiler_capacity_kg')
    def _check_capacity(self):
        for record in self:
            if record.boiler_count <= 0:
                raise ValidationError('Jumlah ketel minimal 1 unit.')
            if record.boiler_capacity_kg < 0:
                raise ValidationError('Kapasitas ketel tidak boleh negatif.')

    @api.constrains('avg_yield_percent')
    def _check_yield(self):
        for record in self:
            if record.avg_yield_percent < 0 or record.avg_yield_percent > 100:
                raise ValidationError('Rendemen rata-rata harus 0-100 persen.')
