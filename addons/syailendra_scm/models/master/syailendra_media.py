# -*- coding: utf-8 -*-
import re

from odoo import api, fields, models
from odoo.exceptions import ValidationError

MEDIA_KINDS = [
    ('image', 'Gambar'),
    ('document', 'Dokumen'),
    ('video', 'Video'),
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

STORAGE_BACKENDS = [
    ('odoo', 'Odoo Filestore'),
    ('supabase', 'Supabase Storage'),
]

IMAGE_MIMETYPES = ('image/jpeg', 'image/png', 'image/webp')
DOCUMENT_MIMETYPES = ('application/pdf',)
VIDEO_MIMETYPES = ('video/mp4', 'video/webm')

MIMETYPES_BY_KIND = {
    'image': IMAGE_MIMETYPES,
    'document': DOCUMENT_MIMETYPES,
    'video': VIDEO_MIMETYPES,
}

MIMETYPE_LABELS = {
    'image': 'Format gambar harus JPEG, PNG, atau WebP.',
    'document': 'Dokumen pendukung harus berformat PDF.',
    'video': 'Video harus berformat MP4 atau WebM.',
}

CHECKSUM_RE = re.compile(r'^[0-9a-f]{64}$')
STORAGE_KEY_RE = re.compile(r'^media/[A-Za-z0-9_@./-]+$')


class SyailendraMedia(models.Model):
    """Media generik (gambar/dokumen/video) untuk pemasok, kebun, penyulingan, produk.

    Satu tabel melayani seluruh entitas lewat pasangan (res_model, res_id). Baris lama
    menyimpan byte di filestore Odoo (kolom ``image``/``document``); baris baru menyimpan
    byte di object storage dan hanya menyimpan ``storage_key`` + metadata di sini.
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
    storage_backend = fields.Selection(
        STORAGE_BACKENDS,
        string='Penyimpanan',
        required=True,
        default='odoo',
        index=True,
    )
    storage_key = fields.Char(string='Kunci Object Storage', index=True, copy=False)
    thumbnail_key = fields.Char(string='Kunci Thumbnail', copy=False)
    checksum = fields.Char(string='Checksum SHA-256', size=64, copy=False)
    duration = fields.Integer(string='Durasi (detik)')
    mimetype = fields.Char(string='MIME Type')
    file_size = fields.Integer(string='Ukuran (byte)')
    caption = fields.Char(string='Keterangan')
    alt_text = fields.Char(string='Teks Alternatif')
    active = fields.Boolean(string='Aktif', default=True, index=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        index=True,
    )

    @api.constrains('kind', 'image', 'document', 'storage_key')
    def _check_payload(self):
        for record in self:
            if record.storage_key:
                continue
            if record.kind == 'image' and not record.image:
                raise ValidationError('Media gambar wajib memiliki berkas gambar.')
            if record.kind == 'document' and not record.document:
                raise ValidationError('Media dokumen wajib memiliki berkas dokumen.')
            if record.kind == 'video':
                raise ValidationError('Media video wajib berada di object storage.')

    @api.constrains('kind', 'mimetype')
    def _check_mimetype(self):
        for record in self:
            if not record.mimetype:
                continue
            allowed = MIMETYPES_BY_KIND.get(record.kind, ())
            if record.mimetype not in allowed:
                raise ValidationError(MIMETYPE_LABELS.get(record.kind, 'Format berkas tidak didukung.'))

    @api.constrains('storage_key', 'thumbnail_key')
    def _check_storage_key(self):
        for record in self:
            for value in (record.storage_key, record.thumbnail_key):
                if not value:
                    continue
                if len(value) > 255 or '..' in value or not STORAGE_KEY_RE.match(value):
                    raise ValidationError(
                        'Kunci object storage tidak valid: harus relatif, di bawah media/, '
                        'dan tanpa segmen "..".'
                    )

    @api.constrains('checksum')
    def _check_checksum(self):
        for record in self:
            if record.checksum and not CHECKSUM_RE.match(record.checksum):
                raise ValidationError(
                    'Checksum harus SHA-256 hex 64 karakter huruf kecil.'
                )

    @api.constrains('duration')
    def _check_duration(self):
        for record in self:
            if record.duration < 0:
                raise ValidationError('Durasi media tidak boleh negatif.')