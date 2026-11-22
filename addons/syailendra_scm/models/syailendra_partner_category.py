# -*- coding: utf-8 -*-
"""Hierarchical supplier category model (mirrors res.partner.category structure).

``syailendra.partner.category`` is the procurement grouping hierarchy for
suppliers: root categories with nested sub-categories (parent_id / child_ids /
parent_path), a tag color, and a name that must be unique within one parent.
"""

from odoo import api, fields, models


class SyailendraPartnerCategory(models.Model):
    """Kategori pemasok hierarkis (parent/child, seperti res.partner.category)."""

    _name = 'syailendra.partner.category'
    _description = 'Kategori Pemasok Hierarkis'
    _order = 'sequence, name'
    _parent_name = 'parent_id'
    _parent_store = True
    _rec_name = 'display_name'

    name = fields.Char(string='Nama Kategori', required=True, tracking=True)
    parent_id = fields.Many2one(
        'syailendra.partner.category',
        string='Kategori Induk',
        index=True,
        ondelete='restrict',
        tracking=True,
    )
    child_ids = fields.One2many(
        'syailendra.partner.category', 'parent_id', string='Sub-Kategori'
    )
    parent_path = fields.Char(index=True)
    display_name = fields.Char(string='Jalur Hierarki', compute='_compute_display_name', store=True)
    color = fields.Integer(string='Warna Tag', default=0, help='0-11, mirip res.partner.category')
    active = fields.Boolean(string='Aktif', default=True)
    sequence = fields.Integer(string='Urutan', default=10)
    description = fields.Text(string='Keterangan')

    _sql_constraints = [
        (
            'name_unique_per_parent',
            'UNIQUE(name, parent_id)',
            'Nama kategori harus unik dalam satu kategori induk yang sama.',
        ),
    ]

    @api.depends('name', 'parent_id.display_name')
    def _compute_display_name(self):
        for record in self:
            parts = []
            node = record
            visited = set()
            while node is not None and node.id not in visited:
                visited.add(node.id)
                parts.append(node.name)
                node = node.parent_id
            record.display_name = ' / '.join(reversed(parts))

