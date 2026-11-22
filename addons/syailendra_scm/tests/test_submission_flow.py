# -*- coding: utf-8 -*-
"""Submission lifecycle: ownership guard, review, idempotent promotion."""
from odoo import fields
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests.common import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestSubmissionFlow(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.ref('base.main_company')
        cls.manager = cls.env['res.users'].create({
            'name': 'SCM Manager Uji Flow', 'login': 'sg12_flow_manager',
            'email': 'sg12_flow_manager@example.com',
            'groups_id': [(6, 0, [cls.env.ref('syailendra_scm.group_scm_manager').id])],
        })
        cls.api_user = cls.env['res.users'].create({
            'name': 'SCM API Uji Flow', 'login': 'sg12_flow_api',
            'email': 'sg12_flow_api@example.com',
            'groups_id': [(6, 0, [cls.env.ref('syailendra_scm.group_scm_api').id])],
        })
        cls.farmer = cls.env['res.partner'].create({
            'name': 'Petani Flow', 'supplier_rank': 1, 'company_id': cls.company.id,
        })
        cls.other = cls.env['res.partner'].create({
            'name': 'Petani Lain', 'supplier_rank': 1, 'company_id': cls.company.id,
        })
        cls.access = cls.env['syailendra.partner.access'].create({
            'partner_id': cls.farmer.id, 'access_code': 'FMR-TST-100', 'role': 'farmer',
        })
        cls.other_access = cls.env['syailendra.partner.access'].create({
            'partner_id': cls.other.id, 'access_code': 'FMR-TST-200', 'role': 'farmer',
        })
        cls.crop = cls.env['syailendra.crop'].create({
            'name': 'Nilam Uji', 'code': 'CROPSG12001', 'latin_name': 'Pogostemon cablin',
        })
        cls.farm = cls.env['syailendra.farm'].create({
            'name': 'Blok Uji', 'code': 'FRM-TST-001',
            'partner_id': cls.farmer.id, 'company_id': cls.company.id,
            'farming_system': 'organic', 'crop_ids': [(6, 0, cls.crop.ids)],
        })
        cls.product = cls.env['product.product'].create({'name': 'Minyak Nilam Uji Flow'})

    def _submission(self, kind, payload):
        return self.env['syailendra.partner.submission'].with_user(self.api_user).create({
            'partner_id': self.farmer.id,
            'kind': kind,
            'company_id': self.company.id,
            'payload': payload,
        })

    def _harvest_submission(self):
        return self._submission('harvest', {
            'farm_id': self.farm.id,
            'crop_id': self.crop.id,
            'harvest_date': '2026-11-01',
            'wet_weight_kg': 120.5,
            'harvest_condition': 'fresh',
        })

    def test_01_submit_and_promote_once(self):
        submission = self._harvest_submission()
        submission.action_submit(self.access.id)
        self.assertEqual(submission.state, 'submitted')
        submission.with_user(self.manager).action_start_review()
        submission.with_user(self.manager).action_approve({})
        self.assertEqual(submission.state, 'approved')
        self.assertEqual(submission.promoted_model, 'syailendra.harvest')
        harvest = self.env['syailendra.harvest'].browse(submission.promoted_id)
        self.assertEqual(harvest.wet_weight_kg, 120.5)
        self.assertEqual(harvest.partner_id, self.farmer)
        self.assertTrue(harvest.name.startswith('HAR-'))
        # Idempotency: approving again must not create a second harvest.
        before = self.env['syailendra.harvest'].search_count([])
        submission.with_user(self.manager).action_approve({})
        self.assertEqual(self.env['syailendra.harvest'].search_count([]), before)

    def test_02_cross_partner_submit_is_denied(self):
        submission = self._harvest_submission()
        with self.assertRaises(AccessError):
            submission.action_submit(self.other_access.id)

    def test_03_revision_increments_and_requires_notes(self):
        submission = self._harvest_submission()
        submission.action_submit(self.access.id)
        with self.assertRaises(UserError):
            submission.with_user(self.manager).action_request_revision('')
        submission.with_user(self.manager).action_request_revision('Foto panen kurang jelas')
        self.assertEqual(submission.state, 'needs_revision')
        submission.action_submit(self.access.id)
        self.assertEqual(submission.revision, 2)
        self.assertEqual(submission.state, 'submitted')

    def test_04_non_manager_cannot_approve(self):
        submission = self._harvest_submission()
        submission.action_submit(self.access.id)
        with self.assertRaises(AccessError):
            submission.with_user(self.api_user).action_approve({})

    def test_05_missing_master_link_blocks_promotion(self):
        submission = self.env['syailendra.partner.submission'].with_user(self.api_user).create({
            'partner_id': self.farmer.id, 'kind': 'harvest', 'company_id': self.company.id,
            # Semua kunci wajib submit terpenuhi, tapi kebun tak terdaftar -> ditolak pada promotion.
            'payload': {'farm_id': 999999, 'crop_id': self.crop.id,
                        'harvest_date': '2026-11-02', 'wet_weight_kg': 10},
        })
        submission.action_submit(self.access.id)
        with self.assertRaises(UserError):
            submission.with_user(self.manager).action_approve({})

    def test_06_foreign_farm_is_rejected(self):
        foreign_farm = self.env['syailendra.farm'].create({
            'name': 'Blok Mitra Lain', 'code': 'FRM-TST-002', 'partner_id': self.other.id,
            'company_id': self.company.id, 'farming_system': 'organic',
        })
        submission = self.env['syailendra.partner.submission'].with_user(self.api_user).create({
            'partner_id': self.farmer.id, 'kind': 'harvest', 'company_id': self.company.id,
            'payload': {
                'farm_id': foreign_farm.id, 'crop_id': self.crop.id,
                'harvest_date': '2026-11-03', 'wet_weight_kg': 5,
            },
        })
        submission.action_submit(self.access.id)
        with self.assertRaises(UserError):
            submission.with_user(self.manager).action_approve({})

    def test_07_handover_sets_delivered(self):
        submission = self._harvest_submission()
        submission.action_submit(self.access.id)
        submission.with_user(self.manager).action_approve({})
        harvest = self.env['syailendra.harvest'].browse(submission.promoted_id)
        handover = self.env['syailendra.partner.submission'].with_user(self.api_user).create({
            'partner_id': self.farmer.id, 'kind': 'handover', 'company_id': self.company.id,
            'payload': {'harvest_id': harvest.id, 'handover_weight_kg': 100.0},
        })
        handover.action_submit(self.access.id)
        handover.with_user(self.manager).action_approve({})
        self.assertEqual(harvest.state, 'delivered')
        self.assertEqual(harvest.handover_weight_kg, 100.0)

    def test_08_empty_payload_cannot_submit(self):
        submission = self.env['syailendra.partner.submission'].with_user(self.api_user).create({
            'partner_id': self.farmer.id, 'kind': 'harvest', 'company_id': self.company.id,
        })
        with self.assertRaises(UserError):
            submission.action_submit(self.access.id)

    def test_09_api_user_cannot_write_state(self):
        submission = self._harvest_submission()
        with self.assertRaises(UserError):
            submission.with_user(self.api_user).write({'state': 'approved'})
        with self.assertRaises(UserError):
            submission.with_user(self.api_user).write({'promoted_id': 1})
        self.assertEqual(submission.state, 'draft')

    def test_10_same_province_guard(self):
        Submission = self.env['syailendra.partner.submission']
        states = self.env['res.country.state'].search([], limit=2)
        self.assertGreaterEqual(len(states), 2, 'butuh dua provinsi untuk uji guard')
        # Same province passes.
        Submission._assert_same_region(states[0], states[0])
        # Different province is refused.
        with self.assertRaises(UserError):
            Submission._assert_same_region(states[0], states[1])
        # Unknown province on either side is refused, never assumed.
        empty = self.env['res.country.state']
        with self.assertRaises(UserError):
            Submission._assert_same_region(empty, states[0])
        with self.assertRaises(UserError):
            Submission._assert_same_region(states[0], empty)

    # ------------------------------------------------------------------
    # Per-kind submit validator + structured error codes
    # ------------------------------------------------------------------
    def test_11_submit_empty_payload_uses_structured_code(self):
        submission = self.env['syailendra.partner.submission'].with_user(self.api_user).create({
            'partner_id': self.farmer.id, 'kind': 'harvest', 'company_id': self.company.id,
        })
        with self.assertRaises(ValidationError) as caught:
            submission.action_submit(self.access.id)
        self.assertTrue(str(caught.exception).startswith('E_SUBMIT_EMPTY:'))

    def test_12_submit_missing_required_field_per_kind(self):
        for kind in ('farmer_profile', 'harvest', 'handover', 'distillation',
                     'shipment', 'partnership_request'):
            submission = self._submission(kind, {'name': 'Uji'})
            with self.assertRaises(ValidationError) as caught:
                submission.action_submit(self.access.id)
            message = str(caught.exception)
            self.assertTrue(
                message.startswith('E_SUBMIT_MISSING:'), (kind, message)
            )

    def test_13_submit_message_lists_each_missing_field(self):
        submission = self._submission('harvest', {'farm_id': self.farm.id})
        with self.assertRaises(ValidationError) as caught:
            submission.action_submit(self.access.id)
        message = str(caught.exception)
        self.assertTrue(message.startswith('E_SUBMIT_MISSING:'))
        for field in ('crop_id', 'harvest_date', 'wet_weight_kg'):
            self.assertIn(field, message)

    def test_14_submit_farmer_profile_validates_nested_farm(self):
        payload = {'nik': '1234567890123456', 'name': 'Petani Uji', 'land_area_m2': 500}
        submission = self._submission('farmer_profile', payload)
        with self.assertRaises(ValidationError) as caught:
            submission.action_submit(self.access.id)
        self.assertIn('farm', str(caught.exception))
        payload['farm'] = {'name': 'Lahan Uji'}
        submission = self._submission('farmer_profile', payload)
        with self.assertRaises(ValidationError) as caught:
            submission.action_submit(self.access.id)
        self.assertIn('farm.farming_system', str(caught.exception))

    def test_15_valid_payload_per_kind_can_submit(self):
        supplier_type = self.env.ref('syailendra_scm.st_petani')
        cases = {
            'farmer_profile': {
                'nik': '1234567890123456', 'name': 'Petani Uji', 'land_area_m2': 500,
                'farm': {'name': 'Lahan Uji', 'farming_system': 'organic'},
            },
            'harvest': {
                'farm_id': self.farm.id, 'crop_id': self.crop.id,
                'harvest_date': '2026-11-01', 'wet_weight_kg': 10,
            },
            'handover': {'harvest_id': self.farm.id},
            'distillation': {
                'harvest_id': self.farm.id, 'product_id': self.product.id,
                'distillation_date': '2026-11-02', 'biomass_input_kg': 10,
            },
            'shipment': {'distillation_id': self.farm.id, 'shipment_date': '2026-11-03'},
            'partnership_request': {
                'ref': 'SUP-TST-001', 'supplier_type_id': supplier_type.id, 'name': 'Calon Mitra Uji',
            },
        }
        for kind, payload in cases.items():
            submission = self._submission(kind, payload)
            submission.action_submit(self.access.id)
            self.assertEqual(submission.state, 'submitted', kind)

    def test_16_promotion_error_code_foreign_farm(self):
        foreign_farm = self.env['syailendra.farm'].create({
            'name': 'Blok Mitra Lain', 'code': 'FRM-TST-002', 'partner_id': self.other.id,
            'company_id': self.company.id, 'farming_system': 'organic',
        })
        submission = self._submission('harvest', {
            'farm_id': foreign_farm.id, 'crop_id': self.crop.id,
            'harvest_date': '2026-11-03', 'wet_weight_kg': 5,
        })
        submission.action_submit(self.access.id)
        submission.with_user(self.manager).action_start_review()
        with self.assertRaises(UserError) as caught:
            submission.with_user(self.manager).action_approve({})
        self.assertTrue(str(caught.exception).startswith('E_HARVEST_FOREIGN:'))

    def test_17_promotion_error_code_region_mismatch(self):
        country = self.env.ref('base.id')
        state_a = self.env['res.country.state'].create({
            'name': 'Provinsi A', 'code': 'ID-TEST-A', 'country_id': country.id,
        })
        state_b = self.env['res.country.state'].create({
            'name': 'Provinsi B', 'code': 'ID-TEST-B', 'country_id': country.id,
        })
        farm_a = self.env['syailendra.farm'].create({
            'name': 'Blok A', 'code': 'FRM-TEST-A', 'partner_id': self.farmer.id,
            'company_id': self.company.id, 'farming_system': 'organic',
            'state_id': state_a.id, 'crop_ids': [(6, 0, self.crop.ids)],
        })
        distillery_b = self.env['syailendra.distillery'].create({
            'name': 'Fasilitas B', 'code': 'DST-TEST-B', 'partner_id': self.farmer.id,
            'company_id': self.company.id, 'state_id': state_b.id,
        })
        harvest = self.env['syailendra.harvest'].create({
            'partner_id': self.farmer.id, 'farm_id': farm_a.id, 'crop_id': self.crop.id,
            'harvest_date': '2026-11-01', 'wet_weight_kg': 100.0, 'state': 'delivered',
            'company_id': self.company.id,
        })
        submission = self._submission('distillation', {
            'harvest_id': harvest.id, 'product_id': self.product.id,
            'distillation_date': '2026-11-02', 'biomass_input_kg': 50,
        })
        submission.action_submit(self.access.id)
        submission.with_user(self.manager).action_start_review()
        with self.assertRaises(UserError) as caught:
            submission.with_user(self.manager).action_approve(
                {str(submission.id): {'distillery_id': distillery_b.id}}
            )
        self.assertTrue(str(caught.exception).startswith('E_REGION_MISMATCH:'))

    def test_18_promotion_error_code_missing_master_link(self):
        # Dibuat langsung ke status submitted (melewati action_submit) untuk
        # memaksa validasi ulang di sisi promotion.
        submission = self.env['syailendra.partner.submission'].create({
            'partner_id': self.farmer.id, 'kind': 'harvest', 'company_id': self.company.id,
            'state': 'submitted', 'submitted_at': fields.Datetime.now(),
            'payload': {'harvest_date': '2026-11-02', 'wet_weight_kg': 10},
        })
        submission.with_user(self.manager).action_start_review()
        with self.assertRaises(UserError) as caught:
            submission.with_user(self.manager).action_approve({})
        self.assertTrue(str(caught.exception).startswith('E_PROMO_LINK_MISSING:'))

    def test_19_review_notes_have_minimum_length(self):
        submission = self._harvest_submission()
        submission.action_submit(self.access.id)
        submission.with_user(self.manager).action_start_review()
        with self.assertRaises(UserError) as caught:
            submission.with_user(self.manager).action_request_revision('pendek')
        self.assertTrue(str(caught.exception).startswith('E_REVIEW_NOTES_SHORT:'))
        self.assertEqual(submission.state, 'in_review')
        submission.with_user(self.manager).action_request_revision(
            'Foto panen kurang jelas, perlu ulang sekali lagi.'
        )
        self.assertEqual(submission.state, 'needs_revision')
        self.assertEqual(submission.review_notes, 'Foto panen kurang jelas, perlu ulang sekali lagi.')

    def test_20_reject_notes_have_minimum_length(self):
        submission = self._harvest_submission()
        submission.action_submit(self.access.id)
        with self.assertRaises(UserError) as caught:
            submission.with_user(self.manager).action_reject('no')
        self.assertTrue(str(caught.exception).startswith('E_REJECT_NOTES_SHORT:'))
        submission.with_user(self.manager).action_reject('Kualitas biomass tidak sesuai standar.')
        self.assertEqual(submission.state, 'rejected')
