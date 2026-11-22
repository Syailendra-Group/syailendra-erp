# -*- coding: utf-8 -*-
"""Portal access credentials for upstream partners (farmers and distillers).

A partner never owns an Odoo user: the public portal authenticates against this
model through a dedicated verification method. The PIN hash is restricted to the
system group so it can never be read back over RPC, and every sensitive read or
write happens inside a scoped ``sudo()`` block that never returns the hash.
"""
import logging
import secrets
from datetime import timedelta

from passlib.hash import pbkdf2_sha256

from odoo import _, api, fields, models
from odoo.exceptions import AccessError, ValidationError

_logger = logging.getLogger(__name__)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
PIN_LENGTH = 6

ROLE_SELECTION = [
    ('farmer', 'Petani'),
    ('distiller', 'Penyuling'),
]


class SyailendraPartnerAccess(models.Model):
    """One portal credential per upstream partner."""

    _name = 'syailendra.partner.access'
    _description = 'Akses Portal Mitra Hulu'
    _order = 'access_code'
    _rec_name = 'access_code'

    partner_id = fields.Many2one(
        'res.partner', string='Mitra', required=True, index=True, ondelete='cascade',
        domain="[('supplier_rank', '>', 0)]",
    )
    access_code = fields.Char(
        string='Kode Mitra', required=True, index=True, copy=False,
        help='Identitas login portal. Petani memakai FMR-*, pemasok lain SUP-*.',
    )
    role = fields.Selection(ROLE_SELECTION, string='Peran', required=True, default='farmer')
    pin_hash = fields.Char(
        string='PIN Hash', copy=False, groups='base.group_system',
        help='Tidak pernah dibaca melalui RPC. Hanya dipakai di dalam verifikasi.',
    )
    active = fields.Boolean(default=True)
    must_change_pin = fields.Boolean(string='Wajib Ganti PIN', default=True, copy=False)
    failed_attempts = fields.Integer(string='Percobaan Gagal', default=0, copy=False)
    locked_until = fields.Datetime(string='Terkunci Sampai', copy=False)
    last_login_at = fields.Datetime(string='Login Terakhir', copy=False)
    last_login_ip = fields.Char(string='IP Terakhir', copy=False)
    pin_updated_at = fields.Datetime(string='PIN Diperbarui', copy=False)
    company_id = fields.Many2one(
        'res.company', string='Perusahaan', related='partner_id.company_id', store=True, index=True,
    )
    log_ids = fields.One2many('syailendra.portal.access.log', 'access_id', string='Log Akses')

    _sql_constraints = [
        ('partner_uniq', 'unique(partner_id)', 'Satu mitra hanya boleh memiliki satu akses portal.'),
        ('access_code_uniq', 'unique(access_code)', 'Kode mitra harus unik.'),
    ]

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @api.model
    def _new_pin(self):
        """Return a cryptographically random numeric PIN (never logged)."""
        return ''.join(str(secrets.randbelow(10)) for _ in range(PIN_LENGTH))

    @api.model
    def _log_event(self, access, event, success, ip=None, user_agent=None):
        self.env['syailendra.portal.access.log'].sudo().create({
            'access_id': access.id if access else False,
            'event': event,
            'success': success,
            'ip': (ip or '')[:64],
            'user_agent': (user_agent or '')[:255],
        })

    def _require_manager(self):
        if not self.env.user.has_group('syailendra_scm.group_scm_manager'):
            raise AccessError(_('Hanya SCM Manager yang dapat mengelola akses portal.'))

    @api.constrains('access_code')
    def _check_access_code(self):
        for record in self:
            code = (record.access_code or '').strip()
            if not code or ' ' in code:
                raise ValidationError(_('Kode mitra wajib diisi dan tanpa spasi.'))

    @api.model
    def _register_failure(self, record, now):
        """Count one failed credential attempt and lock at the threshold.

        Shared by login and PIN change so the PIN-change endpoint cannot be
        used as an unlimited brute-force oracle against a 6-digit PIN.
        """
        attempts = record.failed_attempts + 1
        values = {'failed_attempts': attempts}
        if attempts >= MAX_FAILED_ATTEMPTS:
            values['locked_until'] = now + timedelta(minutes=LOCKOUT_MINUTES)
            values['failed_attempts'] = 0
        record.write(values)
        return bool(values.get('locked_until'))

    @api.model
    def _is_weak_pin(self, new_pin, old_pin):
        """Reject short/non-numeric, repeated, sequential and unchanged PINs."""
        if len(new_pin) != PIN_LENGTH or not new_pin.isdigit():
            return True
        if new_pin == old_pin or len(set(new_pin)) == 1:
            return True
        digits = [int(char) for char in new_pin]
        ascending = all(b - a == 1 for a, b in zip(digits, digits[1:]))
        descending = all(a - b == 1 for a, b in zip(digits, digits[1:]))
        return ascending or descending

    # ------------------------------------------------------------------
    # Credential lifecycle (manager only)
    # ------------------------------------------------------------------
    def action_generate_pin(self):
        """Issue a fresh PIN. The plaintext is returned once and never stored."""
        self._require_manager()
        pin = self._new_pin()
        now = fields.Datetime.now()
        for record in self:
            record.sudo().write({
                'pin_hash': pbkdf2_sha256.hash(pin),
                'must_change_pin': True,
                'failed_attempts': 0,
                'locked_until': False,
                'pin_updated_at': now,
            })
            self._log_event(record, 'pin_issued', True)
        return {'access_code': self.access_code, 'pin': pin}

    def action_unlock(self):
        self._require_manager()
        for record in self:
            record.sudo().write({'failed_attempts': 0, 'locked_until': False})
            self._log_event(record, 'unlocked', True)
        return True

    # ------------------------------------------------------------------
    # Verification (called by the trusted portal server only)
    # ------------------------------------------------------------------
    @api.model
    def verify_access(self, code, pin, ip=None, user_agent=None):
        """Verify a login attempt without ever exposing the stored hash.

        Returns a plain dict so the caller never receives a recordset that could
        be read further. Failure reasons are generic to avoid account enumeration.
        """
        code = (code or '').strip().upper()
        pin = (pin or '').strip()
        denied = {'ok': False, 'reason': 'invalid_credentials'}
        if not code or not pin:
            return denied

        record = self.sudo().search([('access_code', '=', code)], limit=1)
        if not record or not record.active:
            self._log_event(self.browse(), 'login_fail', False, ip, user_agent)
            return denied

        now = fields.Datetime.now()
        if record.locked_until and record.locked_until > now:
            self._log_event(record, 'login_locked', False, ip, user_agent)
            return {'ok': False, 'reason': 'locked', 'locked_until': record.locked_until.isoformat()}

        stored = record.pin_hash
        if not stored or not pbkdf2_sha256.verify(pin, stored):
            locked = self._register_failure(record, now)
            self._log_event(record, 'login_fail', False, ip, user_agent)
            return {'ok': False, 'reason': 'locked'} if locked else denied

        record.write({
            'failed_attempts': 0,
            'locked_until': False,
            'last_login_at': now,
            'last_login_ip': (ip or '')[:64],
        })
        self._log_event(record, 'login_ok', True, ip, user_agent)
        return {
            'ok': True,
            'access_id': record.id,
            'partner_id': record.partner_id.id,
            'partner_name': record.partner_id.name,
            'role': record.role,
            'company_id': record.company_id.id or self.env.company.id,
            'must_change_pin': record.must_change_pin,
        }

    @api.model
    def change_pin(self, access_id, old_pin, new_pin):
        """Partner self-service PIN change; requires the current PIN.

        Shares the login lockout counter: a wrong old PIN counts as a failed
        attempt and locks the access at the same threshold as a failed login.
        """
        record = self.sudo().browse(int(access_id)).exists()
        if not record or not record.active:
            return {'ok': False, 'reason': 'invalid_credentials'}

        now = fields.Datetime.now()
        if record.locked_until and record.locked_until > now:
            self._log_event(record, 'pin_change_fail', False)
            return {'ok': False, 'reason': 'locked', 'locked_until': record.locked_until.isoformat()}

        old_pin = (old_pin or '').strip()
        if not record.pin_hash or not pbkdf2_sha256.verify(old_pin, record.pin_hash):
            locked = self._register_failure(record, now)
            self._log_event(record, 'pin_change_fail', False)
            if locked:
                return {'ok': False, 'reason': 'locked'}
            return {'ok': False, 'reason': 'invalid_credentials'}

        new_pin = (new_pin or '').strip()
        if self._is_weak_pin(new_pin, old_pin):
            return {'ok': False, 'reason': 'weak_pin'}

        record.write({
            'pin_hash': pbkdf2_sha256.hash(new_pin),
            'must_change_pin': False,
            'failed_attempts': 0,
            'locked_until': False,
            'pin_updated_at': now,
        })
        self._log_event(record, 'pin_changed', True)
        return {'ok': True}
