# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError

PLANT_PARTS = [
    ('leaves', 'Daun (Leaves)'),
    ('rhizome', 'Rimpang (Rhizome)'),
    ('wood', 'Kayu (Wood)'),
    ('bark', 'Kulit Batang (Bark)'),
    ('seeds', 'Biji (Seeds)'),
    ('flowers', 'Bunga (Flowers)'),
    ('fruit', 'Buah (Fruit)'),
    ('roots', 'Akar (Roots)'),
]


class SyailendraCrop(models.Model):
    """Master tanaman/komoditas atsiri berdasarkan taksonomi botani."""

    _name = 'syailendra.crop'
    _description = 'Master Tanaman & Komoditas Atsiri'
    _order = 'name'

    name = fields.Char(string='Nama Lokal', required=True, index='trigram')
    latin_name = fields.Char(
        string='Nama Latin / Botanis',
        required=True,
        index='trigram',
        help='Nama ilmiah untuk keperluan INCI dan dokumen ekspor.',
    )
    code = fields.Char(
        string='Kode Komoditas',
        size=10,
        required=True,
        help='Kode internal, misal: NL (Nilam), SW (Serai Wangi), CG (Cengkeh).',
    )
    plant_part = fields.Selection(
        PLANT_PARTS,
        string='Bagian Tanaman Disuling',
        required=True,
        default='leaves',
    )
    cultivation_status = fields.Selection(
        [('cultivated', 'Budidaya'), ('wild', 'Liar (Wild Harvested)')],
        string='Status Sumber Daya',
        required=True,
        default='cultivated',
        help='Wajib dicatat untuk kepatuhan CITES (mis. gaharu).',
    )
    lifespan_months = fields.Integer(string='Umur Produktif Tanaman (Bulan)')
    harvest_season = fields.Char(string='Musim Panen Optimal')
    harvest_frequency = fields.Char(string='Frekuensi Panen')
    description = fields.Text(string='Catatan Agronomi')
    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        index=True,
    )

    _sql_constraints = [
        (
            'syailendra_crop_code_uniq',
            'unique(code, company_id)',
            'Kode komoditas harus unik per perusahaan.',
        ),
    ]

    @api.constrains('code')
    def _check_code(self):
        for record in self:
            if record.code and not record.code.isalnum():
                raise ValidationError(
                    'Kode komoditas hanya boleh huruf dan angka.'
                )
