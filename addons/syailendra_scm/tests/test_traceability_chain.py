# -*- coding: utf-8 -*-
"""Rantai lot: penerbitan lot suling, penerimaan bahan baku, dan token publik."""
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests.common import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestTraceabilityChain(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))
        cls.company = cls.env.ref('base.main_company')
        cls.api_user = cls.env['res.users'].create({
            'name': 'SCM API Uji Label',
            'login': 'sg14_label_api',
            'email': 'sg14_label_api@example.com',
            'groups_id': [(6, 0, [cls.env.ref('syailendra_scm.group_scm_api').id])],
        })
        cls.partner = cls.env['res.partner'].create({
            'name': 'Penyuling Uji Label',
            'supplier_rank': 1,
            'company_id': cls.company.id,
        })
        cls.state = cls.env['res.country.state'].search([], limit=1)
        cls.crop = cls.env['syailendra.crop'].create({
            'name': 'Nilam Uji Label',
            'code': 'CROPLBL001',
            'latin_name': 'Pogostemon cablin',
        })
        cls.farm = cls.env['syailendra.farm'].create({
            'name': 'Blok Uji Label',
            'code': 'FRM-LBL-001',
            'partner_id': cls.partner.id,
            'company_id': cls.company.id,
            'farming_system': 'organic',
            'state_id': cls.state.id,
            'crop_ids': [(6, 0, cls.crop.ids)],
        })
        cls.harvest = cls.env['syailendra.harvest'].create({
            'partner_id': cls.partner.id,
            'farm_id': cls.farm.id,
            'crop_id': cls.crop.id,
            'harvest_date': '2026-11-01',
            'wet_weight_kg': 200.0,
            'state': 'delivered',
            'company_id': cls.company.id,
        })
        cls.distillery = cls.env['syailendra.distillery'].create({
            'name': 'Fasilitas Uji Label',
            'code': 'DST-LBL-001',
            'partner_id': cls.partner.id,
            'company_id': cls.company.id,
            'state_id': cls.state.id,
        })
        cls.product = cls.env['product.product'].create({
            'name': 'Minyak Nilam Uji Label',
            'is_storable': True,
        })

    # ------------------------------------------------------------------ helper
    def _distillation(self, **overrides):
        values = {
            'distillery_id': self.distillery.id,
            'harvest_id': self.harvest.id,
            'product_id': self.product.id,
            'distillation_date': '2026-11-02',
            'biomass_input_kg': 200.0,
            'crude_oil_output_kg': 4.0,
            'company_id': self.company.id,
        }
        values.update(overrides)
        return self.env['syailendra.distillation'].create(values)

    def _receipt(self, **overrides):
        values = {
            'partner_id': self.partner.id,
            'product_id': self.product.id,
            'receipt_date': '2026-11-05',
            'document_qty_kg': 100.0,
            'actual_qty_kg': 98.5,
            'gross_weight_kg': 26.72,
            'tare_weight_kg': 1.65,
            'receiving_officer': 'Petugas Uji',
            'company_id': self.company.id,
        }
        values.update(overrides)
        return self.env['syailendra.rm.receipt'].create(values)

    # ------------------------------------------------------------ lot issuance
    def test_01_action_done_issues_lot_with_full_lineage(self):
        distillation = self._distillation()
        self.assertFalse(distillation.lot_id)
        distillation.action_done()

        lot = distillation.lot_id
        self.assertTrue(lot, 'Batch selesai wajib menerbitkan lot.')
        self.assertEqual(distillation.state, 'done')
        self.assertEqual(lot.name, distillation.name)
        self.assertEqual(lot.product_id, self.product)
        self.assertEqual(lot.harvest_id, self.harvest)
        self.assertEqual(lot.distillation_id, distillation)
        self.assertEqual(lot.farm_id, self.farm)
        self.assertEqual(lot.farmer_id, self.partner)
        self.assertEqual(lot.quarantine_state, 'quarantine')
        self.assertTrue(lot.traceability_complete)

    def test_02_issue_lot_is_idempotent(self):
        distillation = self._distillation()
        first = distillation.action_issue_lot()
        second = distillation.action_issue_lot()
        self.assertEqual(first, second)
        self.assertEqual(
            self.env['stock.lot'].search_count([
                ('distillation_id', '=', distillation.id),
            ]),
            1,
        )

    def test_03_done_without_lot_is_refused(self):
        distillation = self._distillation()
        with self.assertRaises(ValidationError):
            distillation.write({'state': 'done'})

    def test_04_issue_lot_requires_oil_output(self):
        distillation = self._distillation(crude_oil_output_kg=0.0)
        with self.assertRaises(UserError):
            distillation.action_issue_lot()

    def test_05_harvest_counts_issued_lots(self):
        distillation = self._distillation()
        distillation.action_done()
        self.assertEqual(self.harvest.lot_count, 1)
        self.assertIn(distillation.lot_id, self.harvest.lot_ids)

    def test_06_receipt_issues_rm_lot(self):
        distillation = self._distillation()
        distillation.action_done()
        receipt = self._receipt(
            distillation_id=distillation.id,
            distillery_id=self.distillery.id,
        )
        self.assertFalse(receipt.lot_id)
        receipt.action_receive()

        lot = receipt.lot_id
        self.assertTrue(lot, 'Penerimaan wajib menerbitkan lot bahan baku.')
        self.assertEqual(receipt.state, 'received')
        self.assertEqual(lot.name, receipt.name)
        self.assertTrue(lot.name.startswith('RM-'))
        self.assertEqual(lot.distillation_id, distillation)
        self.assertEqual(lot.harvest_id, self.harvest)
        self.assertEqual(lot.farm_id, self.farm)
        self.assertEqual(lot.quarantine_state, 'quarantine')

    def test_07_receipt_discrepancy_and_net_weight(self):
        receipt = self._receipt()
        self.assertAlmostEqual(receipt.discrepancy_kg, -1.5, places=3)
        self.assertAlmostEqual(receipt.net_weight_kg, 25.07, places=3)

    def test_08_receipt_requires_weight_before_lot(self):
        receipt = self._receipt(actual_qty_kg=0.0)
        with self.assertRaises(UserError):
            receipt.action_issue_lot()

    def test_09_receipt_with_lot_cannot_be_cancelled(self):
        receipt = self._receipt()
        receipt.action_receive()
        with self.assertRaises(UserError):
            receipt.action_cancel()

    def test_10_tare_above_gross_is_refused(self):
        with self.assertRaises(ValidationError):
            self._receipt(gross_weight_kg=1.0, tare_weight_kg=2.0)

    def test_11_trace_token_is_random_and_url_contains_it(self):
        distillation = self._distillation()
        lot = distillation.action_issue_lot()
        self.assertTrue(lot.public_trace_token)
        self.assertNotEqual(lot.public_trace_token, lot.name)
        self.assertIn(lot.public_trace_token, lot.trace_url or '')
        self.assertNotIn(lot.name, lot.trace_url or '')

    def test_12_trace_tokens_are_unique_across_lots(self):
        first = self._distillation().action_issue_lot()
        second = self._distillation().action_issue_lot()
        self.assertNotEqual(first.public_trace_token, second.public_trace_token)

    def test_13_regenerate_changes_token(self):
        lot = self._distillation().action_issue_lot()
        before = lot.public_trace_token
        lot.action_regenerate_trace_token()
        self.assertNotEqual(lot.public_trace_token, before)

    def test_14_barcode_source_encodes_url(self):
        lot = self._distillation().action_issue_lot()
        source = lot.label_barcode_src()
        self.assertIn('barcode_type=QR', source)
        self.assertIn('value=', source)

    def test_23_trace_token_unique_constraint_exists(self):
        self.cr.execute(
            "SELECT conname FROM pg_constraint "
            "WHERE conname = 'stock_lot_syailendra_lot_trace_token_uniq'"
        )
        self.assertTrue(
            self.cr.fetchall(),
            'Constraint unik token ketertelusuran tidak terpasang di stock_lot.',
        )
