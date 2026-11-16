# -*- coding: utf-8 -*-
from odoo.exceptions import UserError, ValidationError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestQuarantineGate(TransactionCase):
    """Gerbang mutu lot: hanya lot Approved yang boleh keluar ke pelanggan."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))
        cls.company = cls.env.company
        cls.stock_loc = cls.env['stock.location'].create({
            'name': 'Gudang Uji QC',
            'usage': 'internal',
            'company_id': cls.company.id,
        })
        cls.cust_loc = cls.env['stock.location'].create({
            'name': 'Pelanggan Uji QC',
            'usage': 'customer',
            'company_id': cls.company.id,
        })
        cls.out_type = cls.env['stock.picking.type'].search(
            [('code', '=', 'outgoing'), ('company_id', '=', cls.company.id)], limit=1
        )
        cls.product = cls.env['product.product'].create({
            'name': 'Minyak Nilam Uji',
            'is_storable': True,
            'requires_qc_release': True,
        })
        cls.plain_product = cls.env['product.product'].create({
            'name': 'Produk Tanpa Gerbang QC',
            'is_storable': True,
        })
        cls.lot = cls.env['stock.lot'].create({
            'name': 'LOT-UJI-QC-001',
            'product_id': cls.product.id,
            'company_id': cls.company.id,
        })

    def _line(self, lot, dest):
        picking = self.env['stock.picking'].create({
            'picking_type_id': self.out_type.id,
            'location_id': self.stock_loc.id,
            'location_dest_id': dest.id,
            'company_id': self.company.id,
        })
        move = self.env['stock.move'].create({
            'name': lot.product_id.name,
            'product_id': lot.product_id.id,
            'product_uom_qty': 1.0,
            'product_uom': lot.product_id.uom_id.id,
            'location_id': self.stock_loc.id,
            'location_dest_id': dest.id,
            'picking_id': picking.id,
            'company_id': self.company.id,
        })
        return self.env['stock.move.line'].create({
            'move_id': move.id,
            'picking_id': picking.id,
            'product_id': lot.product_id.id,
            'lot_id': lot.id,
            'quantity': 1.0,
            'product_uom_id': lot.product_id.uom_id.id,
            'location_id': self.stock_loc.id,
            'location_dest_id': dest.id,
            'company_id': self.company.id,
        })

    def test_01_quarantined_lot_blocked_to_customer(self):
        self.assertEqual(self.lot.quarantine_state, 'quarantine')
        with self.assertRaises(ValidationError):
            self._line(self.lot, self.cust_loc)

    def test_02_internal_transfer_allowed_while_quarantined(self):
        self.assertTrue(self._line(self.lot, self.stock_loc))

    def test_03_product_without_gate_allowed(self):
        plain_lot = self.env['stock.lot'].create({
            'name': 'LOT-UJI-UMUM-001',
            'product_id': self.plain_product.id,
            'company_id': self.company.id,
        })
        self.assertTrue(self._line(plain_lot, self.cust_loc))

    def test_04_qc_approve_requires_coa(self):
        inspection = self.env['syailendra.qc.inspection'].create({'lot_id': self.lot.id})
        with self.assertRaises(UserError):
            inspection.action_approve()
        inspection.coa_number = 'COA/UJI/001'
        inspection.action_approve()
        self.assertEqual(self.lot.quarantine_state, 'approved')
        self.assertEqual(self.lot.coa_number, 'COA/UJI/001')
        self.assertTrue(self._line(self.lot, self.cust_loc))

    def test_05_quarantine_state_boundary(self):
        inspection = self.env['syailendra.qc.inspection'].create({
            'lot_id': self.lot.id,
            'coa_number': 'COA/UJI/002',
        })
        inspection.action_approve()
        inspection.action_hold()
        self.assertEqual(self.lot.quarantine_state, 'quarantine')
        with self.assertRaises(ValidationError):
            self._line(self.lot, self.cust_loc)
