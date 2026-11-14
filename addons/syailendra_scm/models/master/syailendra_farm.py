# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError

FARMING_SYSTEMS = [
    ('organic', 'Organik Murni'),
    ('semi_organic', 'Semi Organik'),
    ('conventional', 'Konvensional'),
    ('agroforestry', 'Agroforestri'),
]


class SyailendraFarm(models.Model):
    """Blok lahan/kebun milik mitra pemasok beserta data terroir dan budidaya."""

    _name = 'syailendra.farm'
    _description = 'Kebun / Lahan & Terroir'
    _order = 'partner_id, name'

    name = fields.Char(string='Nama Blok Kebun', required=True)
    code = fields.Char(
        string='Kode Kebun',
        required=True,
        index=True,
        help='Format baku: FRM-[WILAYAH]-[NO_URUT], contoh FRM-JTG-001.',
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Pemilik / Penggarap',
        required=True,
        ondelete='cascade',
        index=True,
        domain="[('supplier_rank', '>', 0)]",
    )
    crop_ids = fields.Many2many(
        'syailendra.crop',
        'syailendra_farm_crop_rel',
        'farm_id',
        'crop_id',
        string='Komoditas Ditanam',
    )

    # --- Lokasi administratif (katalog wilayah BPS) ---
    country_id = fields.Many2one(
        'res.country',
        string='Negara',
        default=lambda self: self.env.ref('base.id', raise_if_not_found=False),
    )
    state_id = fields.Many2one(
        'res.country.state',
        string='Provinsi',
        domain="[('country_id', '=', country_id)]",
    )
    city_id = fields.Many2one('res.country.city', string='Kabupaten / Kota')
    district_id = fields.Many2one('res.country.district', string='Kecamatan')
    subdistrict_id = fields.Many2one(
        'res.country.subdistrict', string='Desa / Kelurahan'
    )
    address_detail = fields.Text(string='Alamat Detail Lahan')

    # --- Geospasial (kepatuhan EUDR) ---
    latitude = fields.Float(string='Latitude', digits=(10, 7))
    longitude = fields.Float(string='Longitude', digits=(10, 7))
    elevation_mdpl = fields.Integer(
        string='Elevasi (mdpl)', help='Ketinggian lahan di atas permukaan laut.'
    )
    area_ha = fields.Float(string='Luas Kebun (Ha)', digits=(16, 4))
    google_maps_url = fields.Char(
        string='Titik Google Maps',
        compute='_compute_google_maps_url',
        store=True,
    )

    # --- Budidaya & keberlanjutan ---
    farming_system = fields.Selection(
        FARMING_SYSTEMS,
        string='Sistem Budidaya',
        required=True,
        default='conventional',
    )
    uses_pesticide = fields.Boolean(string='Menggunakan Pestisida')
    pesticide_types = fields.Char(string='Jenis Pestisida')
    uses_herbicide = fields.Boolean(string='Menggunakan Herbisida')
    herbicide_types = fields.Char(string='Jenis Herbisida')
    fertilizer_types = fields.Char(string='Jenis Pupuk')
    water_source = fields.Char(string='Sumber Air')
    land_history = fields.Text(
        string='Riwayat Lahan',
        help='Riwayat penggunaan lahan untuk verifikasi EUDR (bebas deforestasi).',
    )

    photo_farm = fields.Image(string='Foto Kebun', max_width=1920, max_height=1920)
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
            'syailendra_farm_code_uniq',
            'unique(code, company_id)',
            'Kode kebun harus unik per perusahaan.',
        ),
    ]

    @api.depends('latitude', 'longitude')
    def _compute_google_maps_url(self):
        for record in self:
            if record.latitude and record.longitude:
                record.google_maps_url = (
                    'https://www.google.com/maps?q=%s,%s'
                    % (record.latitude, record.longitude)
                )
            else:
                record.google_maps_url = False

    @api.constrains('latitude', 'longitude')
    def _check_coordinates(self):
        for record in self:
            if record.latitude and not -90.0 <= record.latitude <= 90.0:
                raise ValidationError('Latitude harus berada di antara -90 dan 90.')
            if record.longitude and not -180.0 <= record.longitude <= 180.0:
                raise ValidationError('Longitude harus berada di antara -180 dan 180.')

    @api.constrains('area_ha')
    def _check_area(self):
        for record in self:
            if record.area_ha < 0:
                raise ValidationError('Luas kebun tidak boleh bernilai negatif.')
