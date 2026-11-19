# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError

MEDIA_KINDS = [
    ('image', 'Gambar'),
    ('document', 'Dokumen'),
]

MEDIA_ROLES = [
    ('profile', 'Foto Profil'),
    ('gallery', 'Galeri'),
    ('facility', 'Fasilitas'),
    ('product', 'Produk'),
    ('certificate', 'Sertifikat / CoA'),
    ('legal', 'Dokumen Legal'),
    ('other', 'Lainnya'),
]

IMAGE_MIMETYPES = ('image/jpeg', 'image/png', 'image/webp')
DOCUMENT_MIMETYPES = ('application/pdf',)


class SyailendraMedia(models.Model):
    """Media generik (gambar/dokumen) untuk pemasok, kebun, penyulingan, dan produk.

    Satu tabel melayani seluruh entitas lewat pasangan (res_model, res_id) supaya
    tidak ada empat model duplikat. Binary disimpan di filestore (attachment=True).
    """

    _name = 'syailendra.media'
    _description = 'Media & Dokumen Pendukung'
    _order = 'res_model, res_id, role, sequence, id'

    res_model = fields.Char(string='Model Terkait', required=True, index=True)
    res_id = fields.Integer(string='ID Record', required=True, index=True)
    kind = fields.Selection(MEDIA_KINDS, string='Jenis', required=True, default='image', index=True)
    role = fields.Selection(MEDIA_ROLES, string='Peran', required=True, default='gallery', index=True)
    name = fields.Char(string='Nama Berkas')
    sequence = fields.Integer(string='Urutan', default=10)
    image = fields.Image(string='Gambar', max_width=1920, max_height=1920, attachment=True)
    document = fields.Binary(string='Dokumen', attachment=True)
    mimetype = fields.Char(string='MIME Type')
    file_size = fields.Integer(string='Ukuran (byte)')
    caption = fields.Char(string='Keterangan')
    alt_text = fields.Char(string='Teks Alternatif')
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        index=True,
    )

    @api.constrains('kind', 'image', 'document')
    def _check_payload(self):
        for record in self:
            if record.kind == 'image' and not record.image:
                raise ValidationError('Media gambar wajib memiliki berkas gambar.')
            if record.kind == 'document' and not record.document:
                raise ValidationError('Media dokumen wajib memiliki berkas dokumen.')

    @api.constrains('kind', 'mimetype')
    def _check_mimetype(self):
        for record in self:
            if not record.mimetype:
                continue
            if record.kind == 'image' and record.mimetype not in IMAGE_MIMETYPES:
                raise ValidationError('Format gambar harus JPEG, PNG, atau WebP.')
            if record.kind == 'document' and record.mimetype not in DOCUMENT_MIMETYPES:
                raise ValidationError('Dokumen pendukung harus berformat PDF.')