# -*- coding: utf-8 -*-
"""Registri cetak label QR, ACL, parameter QC, dan render label."""
from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests.common import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestTraceabilityLabel(TransactionCase):

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
    def test_15_label_registry_records_print_event(self):
        lot = self._distillation().action_issue_lot()
        label = self.env['syailendra.qr.label'].create({
            'lot_id': lot.id,
            'preset': 'rm_drum',
            'label_count': 3,
        })
        self.assertTrue(label.name.startswith('LBL-'))
        self.assertEqual(label.payload_url, lot.trace_url)
        self.assertEqual(lot.label_count, 1)
        self.assertEqual(label.printed_by, self.env.user)

    def test_16_label_print_returns_report_action(self):
        lot = self._distillation().action_issue_lot()
        label = self.env['syailendra.qr.label'].create({
            'lot_id': lot.id,
            'preset': 'vial_sample',
        })
        action = label.action_print_label()
        self.assertEqual(action['type'], 'ir.actions.report')
        self.assertEqual(action['report_name'], 'syailendra_scm.report_label_vial')

    def test_17_label_print_requires_trace_token(self):
        lot = self._distillation().action_issue_lot()
        lot.write({'public_trace_token': False})
        label = self.env['syailendra.qr.label'].create({'lot_id': lot.id})
        with self.assertRaises(UserError):
            label.action_print_label()

    def test_18_label_count_must_be_positive(self):
        lot = self._distillation().action_issue_lot()
        with self.assertRaises(UserError):
            self.env['syailendra.qr.label'].create({
                'lot_id': lot.id,
                'label_count': 0,
            })

    def test_19_label_meta_reads_lot_data(self):
        distillation = self._distillation()
        distillation.action_done()
        receipt = self._receipt(distillation_id=distillation.id)
        receipt.action_receive()
        meta = receipt.lot_id.label_meta()
        self.assertEqual(meta['lot'], receipt.name)
        self.assertIn('Minyak Nilam Uji Label', meta['product'])
        self.assertAlmostEqual(meta['net_weight_kg'], 25.07, places=3)
        self.assertEqual(meta['qc_state'], 'Karantina')
        self.assertIn('barcode_type=QR', meta['barcode_src'])

    def test_20_api_user_cannot_create_label(self):
        lot = self._distillation().action_issue_lot()
        with self.assertRaises(AccessError):
            self.env['syailendra.qr.label'].with_user(self.api_user).create({
                'lot_id': lot.id,
            })

    def test_21_api_user_can_read_receipt(self):
        receipt = self._receipt()
        readable = self.env['syailendra.rm.receipt'].with_user(self.api_user)
        self.assertEqual(readable.search_count([('id', '=', receipt.id)]), 1)

    def test_24_label_pdf_renders_for_every_preset(self):
        lot = self._distillation().action_issue_lot()
        presets = [
            ('syailendra_scm.report_label_vial', 50.0, 25.0),
            ('syailendra_scm.report_label_drum', 100.0, 150.0),
            ('syailendra_scm.report_label_retail', 60.0, 40.0),
        ]
        # Odoo mengganti render PDF ke HTML saat test_enable; context ini
        # memaksa wkhtmltopdf benar-benar dijalankan sehingga PDF teruji.
        report_model = self.env['ir.actions.report'].with_context(
            force_report_rendering=True
        )
        for report_name, width, height in presets:
            content, kind = report_model._render_qweb_pdf(report_name, lot.ids)
            self.assertEqual(kind, 'pdf', report_name)
            self.assertTrue(content.startswith(b'%PDF'), report_name)
            self.assertGreater(len(content), 1000, report_name)
            paperformat = report_model._get_report_from_name(
                report_name
            ).paperformat_id
            self.assertAlmostEqual(paperformat.page_width, width, places=0)
            self.assertAlmostEqual(paperformat.page_height, height, places=0)

    def test_25_label_html_embeds_qr_and_trace_token(self):
        lot = self._distillation().action_issue_lot()
        html, _kind = self.env['ir.actions.report']._render_qweb_html(
            'syailendra_scm.report_label_drum', lot.ids
        )
        text = html.decode('utf-8')
        self.assertIn('/report/barcode', text)
        self.assertIn('barcode_type=QR', text)
        self.assertIn(lot.public_trace_token, text)
        self.assertIn(lot.name, text)

    def test_22_qc_inspection_stores_texture_and_solubility(self):
        lot = self._distillation().action_issue_lot()
        inspection = self.env['syailendra.qc.inspection'].create({
            'lot_id': lot.id,
            'texture': 'Kental',
            'solubility': 'Larut jernih dalam etanol 90%',
        })
        self.assertEqual(inspection.texture, 'Kental')
        self.assertIn('etanol', inspection.solubility)
