# -*- coding: utf-8 -*-
from odoo.exceptions import AccessError, ValidationError
from odoo.tests import TransactionCase, tagged
from odoo.tests.common import new_test_user

SEED_IDS = [
    'st_petani',
    'st_penyuling',
    'st_pengepul',
    'st_koperasi',
    'st_kelompok_tani',
    'st_umkm',
    'st_perusahaan',
]


@tagged('post_install', '-at_install')
class TestSupplierTypeMaster(TransactionCase):
    """Master datar jenis supplier: katalog, kode otomatis, validasi, dan ACL."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.SupplierType = cls.env['syailendra.supplier.type']
        cls.manager = new_test_user(
            cls.env,
            login='st_manager',
            groups='syailendra_scm.group_scm_manager',
        )
        cls.scm_user = new_test_user(
            cls.env,
            login='st_user',
            groups='syailendra_scm.group_scm_user',
        )

    def _seed_records(self):
        return self.SupplierType.browse([
            self.env.ref('syailendra_scm.%s' % xml_id).id for xml_id in SEED_IDS
        ])

    def test_01_seed_catalog_has_seven_flat_types(self):
        records = self._seed_records()
        self.assertEqual(len(records), 7)
        self.assertEqual(
            records.mapped('name'),
            ['Petani', 'Penyuling', 'Pengepul', 'Koperasi', 'Kelompok Tani', 'UMKM', 'Perusahaan'],
        )
        self.assertTrue(all(record.active for record in records))
        # Flat by design: no hierarchy field at all on this model.
        self.assertNotIn('parent_id', self.SupplierType._fields)
        self.assertNotIn('child_ids', self.SupplierType._fields)

    def test_02_seed_codes_come_from_the_sequence(self):
        codes = self._seed_records().mapped('code')
        self.assertEqual(len(set(codes)), 7)
        for code in codes:
            self.assertTrue(code.startswith('ST-'), code)

    def test_03_create_assigns_stable_sequential_code(self):
        first = self.SupplierType.create({'name': 'Jenis Uji A'})
        second = self.SupplierType.create({'name': 'Jenis Uji B'})
        self.assertTrue(first.code.startswith('ST-'))
        self.assertNotEqual(first.code, second.code)
        self.assertGreater(
            int(second.code.split('-')[1]), int(first.code.split('-')[1])
        )

    def test_04_name_is_normalised_and_unique(self):
        record = self.SupplierType.create({'name': '  Jenis   Uji   Spasi  '})
        self.assertEqual(record.name, 'Jenis Uji Spasi')
        with self.assertRaises(ValidationError):
            self.SupplierType.create({'name': 'petani'})

    def test_05_duplicate_name_is_rejected_case_insensitively(self):
        self.SupplierType.create({'name': 'Jenis Uji C'})
        with self.assertRaises(ValidationError):
            self.SupplierType.create({'name': 'jenis uji c'})
        # Archived records still reserve the name, so archives are restored
        # rather than duplicated.
        existing = self.SupplierType.search([('name', '=', 'Jenis Uji C')], limit=1)
        existing.active = False
        with self.assertRaises(ValidationError):
            self.SupplierType.create({'name': 'Jenis Uji C'})

    def test_06_partner_count_follows_assignments(self):
        record = self.SupplierType.create({'name': 'Jenis Uji Hitung'})
        self.assertEqual(record.partner_count, 0)
        partner = self.env['res.partner'].create({
            'name': 'Supplier Uji Hitung',
            'supplier_rank': 1,
            'supplier_type_id': record.id,
        })
        # partner_count is a non-stored compute over another model, so a new
        # request recomputes it but this transaction's cache still holds the
        # old value. Invalidate explicitly, the way a fresh request would.
        record.invalidate_recordset(['partner_count'])
        self.assertEqual(record.partner_count, 1)
        partner.supplier_type_id = False
        record.invalidate_recordset(['partner_count'])
        self.assertEqual(record.partner_count, 0)

    def test_07_scm_user_is_read_only(self):
        record = self._seed_records()[0]
        record.with_user(self.scm_user).read(['name'])
        with self.assertRaises(AccessError):
            self.SupplierType.with_user(self.scm_user).create({'name': 'Jenis Uji D'})
        with self.assertRaises(AccessError):
            record.with_user(self.scm_user).write({'description': 'diubah'})

    def test_08_manager_can_create_and_archive(self):
        answer = self.SupplierType.with_user(self.manager).create({
            'name': 'Jenis Uji Manager',
            'description': 'dibuat pengujian',
        })
        answer.with_user(self.manager).write({'description': 'disunting'})
        self.assertEqual(answer.description, 'disunting')
        answer.with_user(self.manager).write({'active': False})
        self.assertFalse(answer.active)

    def test_09_master_records_cannot_be_deleted(self):
        record = self._seed_records()[0]
        with self.assertRaises(AccessError):
            record.with_user(self.manager).unlink()

    def test_10_legacy_selection_field_is_gone(self):
        self.assertNotIn('supplier_type', self.env['res.partner']._fields)
        self.assertIn('supplier_type_id', self.env['res.partner']._fields)
        self.assertIn('supplier_type_needs_review', self.env['res.partner']._fields)

    def test_11_review_flag_defaults_to_false(self):
        partner = self.env['res.partner'].create({
            'name': 'Supplier Uji Flag',
            'supplier_rank': 1,
        })
        self.assertFalse(partner.supplier_type_needs_review)
        partner.supplier_type_needs_review = True
        self.assertTrue(partner.supplier_type_needs_review)
