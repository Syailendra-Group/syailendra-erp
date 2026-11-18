# -*- coding: utf-8 -*-
from odoo import api, fields, models

SUPPLIER_STATUSES = [
    ('active', 'Aktif'),
    ('inactive', 'Nonaktif'),
    ('pending', 'Pending'),
    ('blacklisted', 'Blacklist'),
]

SUPPLIER_GRADES = [
    ('a', 'Grade A'),
    ('b', 'Grade B'),
    ('c', 'Grade C'),
    ('d', 'Grade D'),
]


class ResPartner(models.Model):
    """Ekstensi mitra menjadi Supplier Master rantai pasok atsiri."""

    _inherit = 'res.partner'

    supplier_type_id = fields.Many2one(
        'syailendra.supplier.type',
        string='Jenis Supplier',
        ondelete='restrict',
        index=True,
        help='Satu jenis pelaku usaha utama; kosong bila belum diklasifikasi.',
    )
    supplier_type_needs_review = fields.Boolean(
        string='Jenis Supplier Perlu Review',
        default=False,
        help='Ditandai saat klasifikasi jenis supplier belum diverifikasi manusia.',
    )
    supplier_status = fields.Selection(
        SUPPLIER_STATUSES,
        string='Status Supplier',
        default='pending',
        index=True,
    )
    supplier_grade = fields.Selection(
        SUPPLIER_GRADES, string='Grade Kinerja', readonly=True
    )

    owner_name = fields.Char(string='Nama Pemilik')
    pic_name = fields.Char(string='Penanggung Jawab')
    pic_position = fields.Char(string='Jabatan Penanggung Jawab')
    join_year = fields.Integer(string='Tahun Bergabung')
    nib = fields.Char(string='NIB', size=30, help='Nomor Induk Berusaha.')
    business_license = fields.Char(string='Izin Usaha')
    digital_code = fields.Char(
        string='Supplier Code / QR ID',
        copy=False,
        readonly=True,
        index=True,
        help='Kode digital unik untuk barcode/QR supplier.',
    )

    # --- Relasi aset & produk hulu ---
    farm_ids = fields.One2many(
        'syailendra.farm', 'partner_id', string='Kebun / Lahan'
    )
    distillery_ids = fields.One2many(
        'syailendra.distillery', 'partner_id', string='Fasilitas Penyulingan'
    )
    crop_ids = fields.Many2many(
        'syailendra.crop',
        'syailendra_partner_crop_rel',
        'partner_id',
        'crop_id',
        string='Komoditas Diusahakan',
    )
    supplied_product_ids = fields.Many2many(
        'product.template',
        'syailendra_partner_product_rel',
        'partner_id',
        'product_tmpl_id',
        string='Produk Dihasilkan',
    )
    farm_count = fields.Integer(
        string='Jumlah Kebun', compute='_compute_supplier_asset_counts'
    )
    distillery_count = fields.Integer(
        string='Jumlah Unit Ketel', compute='_compute_supplier_asset_counts'
    )

    # --- Keberlanjutan & sosial (ESG) ---
    farmer_count = fields.Integer(string='Jumlah Petani Binaan')
    worker_count = fields.Integer(string='Jumlah Karyawan')
    female_worker_pct = fields.Float(string='Persentase Pekerja Perempuan (%)', digits=(5, 2))
    no_child_labor = fields.Boolean(string='Bebas Pekerja Anak', default=True)
    fair_wage = fields.Boolean(string='Menerapkan Upah Layak', default=True)
    waste_management = fields.Text(string='Pengelolaan Limbah')
    renewable_energy = fields.Boolean(string='Penggunaan Energi Terbarukan')

    @api.depends('farm_ids', 'distillery_ids')
    def _compute_supplier_asset_counts(self):
        for partner in self:
            partner.farm_count = len(partner.farm_ids)
            partner.distillery_count = len(partner.distillery_ids)

    @api.model_create_multi
    def create(self, vals_list):
        partners = super().create(vals_list)
        for partner in partners:
            if not partner.digital_code:
                partner.digital_code = self.env['ir.sequence'].next_by_code(
                    'syailendra.supplier.code'
                )
        return partners
