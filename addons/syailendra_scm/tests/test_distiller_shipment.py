# -*- coding: utf-8 -*-
"""Distiller shipment lifecycle: manager-only transitions and date guards."""
from odoo.exceptions import AccessError, UserError
from odoo.tests.common import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestDistillerShipment(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.ref('base.main_company')
        cls.manager = cls.env['res.users'].create({
            'name': 'SCM Manager Uji Ship', 'login': 'sg12_ship_manager',
            'email': 'sg12_ship_manager@example.com',
            'groups_id': [(6, 0, [cls.env.ref('syailendra_scm.group_scm_manager').id])],
        })
        cls.api_user = cls.env['res.users'].create({
            'name': 'SCM API Uji Ship', 'login': 'sg12_ship_api',
            'email': 'sg12_ship_api@example.com',
            'groups_id': [(6, 0, [cls.env.ref('syailendra_scm.group_scm_api').id])],
        })
        cls.partner = cls.env['res.partner'].create({
            'name': 'Penyuling Uji Ship', 'supplier_rank': 1, 'company_id': cls.company.id,
        })
        cls.state = cls.env['res.country.state'].search([], limit=1)
        cls.crop = cls.env['syailendra.crop'].create({
            'name': 'Nilam Uji Ship', 'code': 'CROPSHIP01', 'latin_name': 'Pogostemon cablin',
        })
        cls.farm = cls.env['syailendra.farm'].create({
            'name': 'Blok Uji Ship', 'code': 'FRM-SHIP-001', 'partner_id': cls.partner.id,
            'company_id': cls.company.id, 'farming_system': 'organic',
            'state_id': cls.state.id, 'crop_ids': [(6, 0, cls.crop.ids)],
        })
        cls.harvest = cls.env['syailendra.harvest'].create({
            'partner_id': cls.partner.id, 'farm_id': cls.farm.id, 'crop_id': cls.crop.id,
            'harvest_date': '2026-11-01', 'wet_weight_kg': 100.0, 'state': 'delivered',
            'company_id': cls.company.id,
        })
        cls.distillery = cls.env['syailendra.distillery'].create({
            'name': 'Fasilitas Uji Ship', 'code': 'DST-SHIP-001', 'partner_id': cls.partner.id,
            'company_id': cls.company.id, 'state_id': cls.state.id,
        })
        cls.product = cls.env['product.product'].create({'name': 'Minyak Nilam Uji Ship'})
        cls.distillation = cls.env['syailendra.distillation'].create({
            'distillery_id': cls.distillery.id, 'harvest_id': cls.harvest.id,
            'product_id': cls.product.id, 'distillation_date': '2026-11-02',
            'biomass_input_kg': 100.0, 'company_id': cls.company.id,
        })
        cls.shipment = cls.env['syailendra.distiller.shipment'].create({
            'distillation_id': cls.distillation.id, 'product_id': cls.product.id,
            'shipment_date': '2026-11-03', 'quantity_kg': 25.0,
            'company_id': cls.company.id,
        })

    def test_01_send_requires_manager(self):
        with self.assertRaises(AccessError):
            self.shipment.with_user(self.api_user).action_send()
        self.assertEqual(self.shipment.state, 'draft')

    def test_02_send_then_receive(self):
        self.shipment.with_user(self.manager).action_send()
        self.assertEqual(self.shipment.state, 'in_transit')
        self.shipment.with_user(self.manager).action_receive('2026-11-05')
        self.assertEqual(self.shipment.state, 'received')
        self.assertEqual(str(self.shipment.received_at_sbi_date), '2026-11-05')

    def test_03_receive_before_departure_is_refused(self):
        self.shipment.with_user(self.manager).action_send()
        with self.assertRaises(UserError):
            self.shipment.with_user(self.manager).action_receive('2026-11-01')
        self.assertEqual(self.shipment.state, 'in_transit')

    def test_04_receive_requires_in_transit(self):
        with self.assertRaises(UserError):
            self.shipment.with_user(self.manager).action_receive()
        self.assertEqual(self.shipment.state, 'draft')

    def test_05_cancel_blocks_after_receipt(self):
        self.shipment.with_user(self.manager).action_send()
        self.shipment.with_user(self.manager).action_receive('2026-11-05')
        with self.assertRaises(UserError):
            self.shipment.with_user(self.manager).action_cancel()
        self.assertEqual(self.shipment.state, 'received')

    def test_06_cancel_from_draft(self):
        self.shipment.with_user(self.manager).action_cancel()
        self.assertEqual(self.shipment.state, 'cancelled')
        with self.assertRaises(UserError):
            self.shipment.with_user(self.manager).action_cancel()
