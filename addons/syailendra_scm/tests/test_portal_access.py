# -*- coding: utf-8 -*-
"""Portal credential behaviour: issuance, verification, lockout, hash secrecy."""
from odoo.exceptions import AccessError
from odoo.tests.common import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestPartnerAccess(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.ref('base.main_company')
        cls.partner = cls.env['res.partner'].create({
            'name': 'Petani Uji SG12', 'supplier_rank': 1, 'company_id': cls.company.id,
        })
        cls.manager = cls.env['res.users'].create({
            'name': 'SCM Manager Uji', 'login': 'sg12_manager', 'email': 'sg12_manager@example.com',
            'groups_id': [(6, 0, [cls.env.ref('syailendra_scm.group_scm_manager').id])],
        })
        cls.api_user = cls.env['res.users'].create({
            'name': 'SCM API Uji', 'login': 'sg12_api', 'email': 'sg12_api@example.com',
            'groups_id': [(6, 0, [cls.env.ref('syailendra_scm.group_scm_api').id])],
        })
        cls.access = cls.env['syailendra.partner.access'].create({
            'partner_id': cls.partner.id, 'access_code': 'FMR-TST-001', 'role': 'farmer',
        })

    def _issue_pin(self):
        result = self.access.with_user(self.manager).action_generate_pin()
        return result['pin']

    def test_01_issue_and_verify(self):
        pin = self._issue_pin()
        self.assertEqual(len(pin), 6)
        result = self.env['syailendra.partner.access'].with_user(self.api_user).verify_access(
            'FMR-TST-001', pin, ip='127.0.0.1',
        )
        self.assertTrue(result['ok'])
        self.assertEqual(result['partner_id'], self.partner.id)
        self.assertEqual(result['role'], 'farmer')
        self.assertNotIn('pin_hash', result)
        self.assertTrue(result['must_change_pin'])

    def test_02_wrong_pin_then_lockout(self):
        self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        for _attempt in range(5):
            result = Access.verify_access('FMR-TST-001', '000000')
            self.assertFalse(result['ok'])
        self.assertTrue(self.access.locked_until)
        blocked = Access.verify_access('FMR-TST-001', '000000')
        self.assertEqual(blocked['reason'], 'locked')

    def test_03_unknown_code_is_generic(self):
        result = self.env['syailendra.partner.access'].with_user(self.api_user).verify_access(
            'FMR-XXX-999', '123456',
        )
        self.assertEqual(result, {'ok': False, 'reason': 'invalid_credentials'})

    def test_04_hash_never_readable_over_rpc(self):
        self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        # Explicitly asking for the restricted field must be refused outright.
        with self.assertRaises(AccessError):
            Access.search_read([('id', '=', self.access.id)], ['access_code', 'pin_hash'])
        # A normal read never carries the hash.
        rows = Access.search_read([('id', '=', self.access.id)], ['access_code', 'role'])
        self.assertEqual(len(rows), 1)
        self.assertNotIn('pin_hash', rows[0])

    def test_05_generation_requires_manager(self):
        with self.assertRaises(AccessError):
            self.access.with_user(self.api_user).action_generate_pin()

    def test_06_change_pin_requires_old(self):
        pin = self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        bad = Access.change_pin(self.access.id, '999999', '135790')
        self.assertFalse(bad['ok'])
        weak = Access.change_pin(self.access.id, pin, '12')
        self.assertEqual(weak['reason'], 'weak_pin')
        good = Access.change_pin(self.access.id, pin, '135790')
        self.assertTrue(good['ok'])
        self.assertFalse(self.access.must_change_pin)
        self.assertTrue(Access.verify_access('FMR-TST-001', '135790')['ok'])

    def test_07_unlock_clears_lock(self):
        self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        for _attempt in range(5):
            Access.verify_access('FMR-TST-001', '000000')
        self.assertTrue(self.access.locked_until)
        self.access.with_user(self.manager).action_unlock()
        self.assertFalse(self.access.locked_until)
        self.assertEqual(self.access.failed_attempts, 0)

    def test_08_change_pin_shares_lockout(self):
        pin = self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        for _attempt in range(5):
            Access.change_pin(self.access.id, '999999', '135790')
        self.assertTrue(self.access.locked_until)
        # Even the correct old PIN must be refused while locked.
        blocked = Access.change_pin(self.access.id, pin, '246813')
        self.assertEqual(blocked['reason'], 'locked')

    def test_09_trivial_and_unchanged_pins_rejected(self):
        pin = self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        for weak in ('000000', '111111', '123456', '654321', pin):
            result = Access.change_pin(self.access.id, pin, weak)
            self.assertEqual(result['reason'], 'weak_pin', weak)
        self.assertTrue(self.access.must_change_pin)

    def test_10_lockout_parity_between_login_and_pin_change(self):
        """Gagal login dan gagal ganti PIN menambah satu counter lockout bersama."""
        pin = self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        # 3x gagal login, counter bertambah 3, belum terkunci.
        for _attempt in range(3):
            result = Access.verify_access('FMR-TST-001', '000000')
            self.assertFalse(result['ok'])
        self.assertFalse(self.access.locked_until)
        self.assertEqual(self.access.failed_attempts, 3)
        # 2x gagal ganti PIN (salah old PIN) -> total 5, terkunci bersama.
        for _attempt in range(2):
            result = Access.change_pin(self.access.id, '999999', '135790')
            self.assertFalse(result['ok'])
        self.assertTrue(self.access.locked_until)
        self.assertEqual(self.access.failed_attempts, 0)
        # Keduanya menolak saat terkunci.
        blocked_login = Access.verify_access('FMR-TST-001', '000000')
        self.assertEqual(blocked_login['reason'], 'locked')
        # PIN yang benar pun ditolak saat terkunci.
        blocked_change = Access.change_pin(self.access.id, pin, '246813')
        self.assertEqual(blocked_change['reason'], 'locked')

    def test_11_weak_pin_does_not_consume_lockout_attempt(self):
        pin = self._issue_pin()
        Access = self.env['syailendra.partner.access'].with_user(self.api_user)
        # 4x gagal login, satu lagi akan kunci.
        for _attempt in range(4):
            Access.verify_access('FMR-TST-001', '000000')
        self.assertEqual(self.access.failed_attempts, 4)
        self.assertFalse(self.access.locked_until)
        # PIN lemah ditolak tanpa menyentuh counter lockout.
        for weak in ('000000', '111111', pin):
            result = Access.change_pin(self.access.id, pin, weak)
            self.assertEqual(result['reason'], 'weak_pin', weak)
        self.assertEqual(self.access.failed_attempts, 4)
        self.assertFalse(self.access.locked_until)
        # Percobaan kredensial ke-5 akhirnya mengunci.
        result = Access.verify_access('FMR-TST-001', '000000')
        self.assertEqual(result['reason'], 'locked')
        self.assertTrue(self.access.locked_until)
