# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError


class SyailendraSupplierAudit(models.Model):
    """Audit lapangan pemasok beserta temuan dan tindakan korektif (CAPA)."""

    _name = 'syailendra.supplier.audit'
    _description = 'Audit Lapangan Pemasok & CAPA'
    _order = 'audit_date desc, id desc'

    name = fields.Char(
        string='Nomor Audit',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'syailendra.supplier.audit'
        ),
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Pemasok Diaudit',
        required=True,
        index=True,
        domain="[('supplier_rank', '>', 0)]",
    )
    audit_date = fields.Date(
        string='Tanggal Audit',
        required=True,
        default=fields.Date.context_today,
        index=True,
    )
    auditor_name = fields.Char(string='Auditor')
    audit_scope = fields.Selection(
        [
            ('farm', 'Kebun & Praktik Budidaya'),
            ('distillery', 'Fasilitas Penyulingan & Sanitasi'),
            ('social', 'Ketenagakerjaan & Sosial'),
            ('full', 'Komprehensif'),
        ],
        string='Ruang Lingkup',
        required=True,
        default='full',
    )
    findings = fields.Text(string='Temuan Audit')
    capa_action = fields.Text(string='Tindakan Korektif (CAPA)')
    capa_deadline = fields.Date(string='Batas Waktu CAPA')
    follow_up_notes = fields.Text(string='Catatan Tindak Lanjut')
    next_audit_date = fields.Date(string='Jadwal Audit Berikutnya')
    status = fields.Selection(
        [
            ('open', 'Temuan Terbuka'),
            ('in_progress', 'Perbaikan Berjalan'),
            ('closed', 'Selesai & Terverifikasi'),
        ],
        string='Status CAPA',
        default='open',
        required=True,
        index=True,
    )

    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    @api.constrains('audit_date', 'capa_deadline', 'next_audit_date')
    def _check_dates(self):
        for record in self:
            if record.capa_deadline and record.audit_date and record.capa_deadline < record.audit_date:
                raise ValidationError('Batas waktu CAPA tidak boleh mendahului tanggal audit.')
            if record.next_audit_date and record.audit_date and record.next_audit_date <= record.audit_date:
                raise ValidationError('Jadwal audit berikutnya harus setelah tanggal audit.')

    def action_close(self):
        """Tutup temuan audit setelah perbaikan diverifikasi."""
        self.write({'status': 'closed'})
