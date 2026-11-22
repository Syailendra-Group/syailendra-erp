# -*- coding: utf-8 -*-
"""Media storage tier: object-backed rows, video kind, and integration-account ACL."""
from odoo.exceptions import ValidationError
from odoo.tests import TransactionCase, tagged
from odoo.tests.common import new_test_user


@tagged('post_install', '-at_install')
class TestMediaStorage(TransactionCase):
    """Baris media boleh menyimpan byte di object storage (storage_key), bukan hanya biner Odoo."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.ref('base.main_company')
        cls.partner = cls.env['res.partner'].create({
            'name': 'Mitra Media SG13',
            'supplier_rank': 1,
            'company_id': cls.company.id,
        })
        cls.api_user = new_test_user(
            cls.env,
            login='media_api_sg13',
            groups='syailendra_scm.group_scm_api',
        )
        cls.Media = cls.env['syailendra.media']

    def _object_row(self, **vals):
        base = {
            'res_model': 'res.partner',
            'res_id': self.partner.id,
            'kind': 'image',
            'role': 'gallery',
            'name': 'foto.jpg',
            'mimetype': 'image/jpeg',
            'file_size': 1024,
            'storage_backend': 'supabase',
            'storage_key': 'media/res.partner/%s/abc.jpg' % self.partner.id,
            'checksum': 'a' * 64,
        }
        base.update(vals)
        return base

    def test_01_storage_fields_exist(self):
        for field in ('storage_backend', 'storage_key', 'thumbnail_key', 'checksum', 'duration', 'active'):
            self.assertIn(field, self.Media._fields, field)

    def test_02_object_backed_row_needs_no_binary(self):
        row = self.Media.create(self._object_row())
        self.assertEqual(row.storage_key, 'media/res.partner/%s/abc.jpg' % self.partner.id)
        self.assertFalse(row.image)
        self.assertTrue(row.active)

    def test_03_row_without_payload_or_key_is_refused(self):
        with self.assertRaises(ValidationError):
            self.Media.create({
                'res_model': 'res.partner',
                'res_id': self.partner.id,
                'kind': 'image',
            })

    def test_04_video_kind_accepts_mp4_and_rejects_unknown_types(self):
        row = self.Media.create(self._object_row(
            kind='video', mimetype='video/mp4', name='klip.mp4',
            storage_key='media/res.partner/%s/klip.mp4' % self.partner.id,
        ))
        self.assertEqual(row.kind, 'video')
        for bad_mime, ext in (('application/pdf', 'pdf'), ('video/quicktime', 'mov'), ('video/x-matroska', 'mkv')):
            with self.assertRaises(ValidationError):
                self.Media.create(self._object_row(
                    kind='video', mimetype=bad_mime,
                    storage_key='media/res.partner/%s/other.%s' % (self.partner.id, ext),
                ))

    def test_05_storage_key_must_be_relative_media_path(self):
        for bad in ('/etc/passwd', '../../etc/passwd', 'media/../secret.jpg',
                    'https://evil.example/x.jpg', r'media\res.partner\1\x.jpg', 'media/'):
            with self.assertRaises(ValidationError):
                self.Media.create(self._object_row(storage_key=bad))

    def test_06_checksum_is_sha256_hex(self):
        # `size=64` makes over-length values a column concern; the ORM constraint owns shape.
        for bad in ('zz', 'a' * 63, 'A' * 64, 'g' * 64):
            with self.assertRaises(ValidationError):
                self.Media.create(self._object_row(checksum=bad))

    def test_07_integration_account_can_create_media(self):
        row = self.Media.with_user(self.api_user).create(self._object_row())
        self.assertTrue(row.id)
        self.assertFalse(self.Media.with_user(self.api_user).search(
            [('id', '=', row.id)], limit=1,
        ).image)

    def test_08_legacy_binary_row_still_valid(self):
        row = self.Media.create({
            'res_model': 'res.partner',
            'res_id': self.partner.id,
            'kind': 'image',
            'role': 'gallery',
            'name': 'lama.jpg',
            'mimetype': 'image/jpeg',
            'image': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        })
        self.assertFalse(row.storage_key)
        self.assertEqual(row.storage_backend, 'odoo')