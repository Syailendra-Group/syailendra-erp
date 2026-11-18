# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError

SUPPLIER_TYPE_SEQUENCE_CODE = 'syailendra.supplier.type'


class SyailendraSupplierType(models.Model):
    """Master datar jenis pelaku usaha pemasok.

    Katalog dipakai bersama seluruh perusahaan (tanpa company_id) dan tidak
    hierarkis: jenis supplier adalah atribut identitas pelaku usaha, bukan
    pengelompokan pengadaan barang (lihat res.partner.category untuk itu).
    """

    _name = 'syailendra.supplier.type'
    _description = 'Master Jenis Supplier'
    _order = 'sequence, name'

    name = fields.Char(string='Nama Jenis', required=True, index='trigram')
    code = fields.Char(
        string='Kode Jenis',
        required=True,
        copy=False,
        readonly=True,
        index=True,
        help='Kode unik yang dibuat otomatis oleh sistem.',
    )
    description = fields.Text(string='Deskripsi')
    sequence = fields.Integer(string='Urutan', default=10)
    active = fields.Boolean(string='Aktif', default=True)
    partner_count = fields.Integer(
        string='Jumlah Supplier', compute='_compute_partner_count'
    )

    _sql_constraints = [
        (
            'syailendra_supplier_type_code_uniq',
            'unique(code)',
            'Kode jenis supplier harus unik.',
        ),
    ]

    @api.depends()
    def _compute_partner_count(self):
        """Hitung supplier per jenis tanpa sudo agar batas perusahaan berlaku."""
        for record in self:
            record.partner_count = self.env['res.partner'].search_count(
                [('supplier_type_id', '=', record.id)]
            )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name'):
                vals['name'] = ' '.join(str(vals['name']).split())
            if not vals.get('code'):
                vals['code'] = self.env['ir.sequence'].next_by_code(
                    SUPPLIER_TYPE_SEQUENCE_CODE
                )
        return super().create(vals_list)

    def write(self, vals):
        if vals.get('name'):
            vals['name'] = ' '.join(str(vals['name']).split())
        return super().write(vals)

    @api.constrains('name')
    def _check_name_unique(self):
        for record in self:
            if not record.name:
                continue
            duplicate = self.with_context(active_test=False).search([
                ('id', '!=', record.id),
                ('name', '=ilike', record.name),
            ], limit=1)
            if duplicate:
                raise ValidationError(
                    'Nama jenis supplier "%s" sudah digunakan.' % record.name
                )
