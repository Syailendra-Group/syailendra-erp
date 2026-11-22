# -*- coding: utf-8 -*-
"""Append-only audit trail of portal authentication and credential events."""
from odoo import fields, models

EVENT_SELECTION = [
    ('login_ok', 'Login Berhasil'),
    ('login_fail', 'Login Gagal'),
    ('login_locked', 'Login Terkunci'),
    ('pin_issued', 'PIN Diterbitkan'),
    ('pin_changed', 'PIN Diganti'),
    ('pin_change_fail', 'Gagal Ganti PIN'),
    ('unlocked', 'Kunci Dibuka'),
]


class SyailendraPortalAccessLog(models.Model):
    """Never stores a PIN, only the outcome of an attempt."""

    _name = 'syailendra.portal.access.log'
    _description = 'Log Akses Portal Mitra'
    _order = 'create_date desc, id desc'
    _rec_name = 'event'

    access_id = fields.Many2one(
        'syailendra.partner.access', string='Akses', index=True, ondelete='cascade',
    )
    event = fields.Selection(EVENT_SELECTION, string='Peristiwa', required=True, index=True)
    success = fields.Boolean(string='Berhasil', default=False)
    ip = fields.Char(string='Alamat IP')
    user_agent = fields.Char(string='Peramban')
    create_date = fields.Datetime(string='Waktu', readonly=True)
