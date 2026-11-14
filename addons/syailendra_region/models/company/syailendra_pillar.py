# -*- coding: utf-8 -*-
from odoo import api, fields, models


class SyailendraPillar(models.Model):
    _name = 'syailendra.pillar'
    _description = 'Syailendra Business Module Pillar'
    _order = 'sequence asc, id asc'

    code = fields.Char(
        string='Pillar Code',
        required=True,
        index=True,
        help='Technical identifier (ftm, hrm, scm, wms, crm, dcm, ai, imm, others)'
    )
    short_name = fields.Char(
        string='Short Name / Menu Label',
        required=True,
        size=30,
        help='Short code displayed on top navigation and badges (e.g. FTM, HRM, SCM)'
    )
    name = fields.Char(
        string='Full Pillar Name',
        required=True,
        help='Full descriptive title of the business pillar'
    )
    tagline = fields.Char(
        string='Pillar Tagline',
        help='Executive positioning or scope tagline of this module pillar'
    )
    description = fields.Text(
        string='Operational Description',
        help='Detailed explanation of operational modules and responsibilities covered'
    )
    company_id = fields.Many2one(
        comodel_name='res.company',
        string='Owning Corporate Entity',
        required=True,
        index=True,
        ondelete='restrict',
        help='Exclusive corporate entity owner of this business pillar'
    )
    sequence = fields.Integer(
        string='Display Sequence',
        default=10
    )
    active = fields.Boolean(
        string='Active',
        default=True
    )

    _sql_constraints = [
        ('code_unique', 'unique(code)', 'Pillar technical code must be unique!')
    ]

    def _sync_company_pillars(self):
        companies = self.env['res.company'].sudo().search([])
        all_pillars = self.env['syailendra.pillar'].sudo().search(
            [('active', '=', True)], order='sequence asc, id asc'
        )
        for company in companies:
            owned_codes = [p.code for p in all_pillars if p.company_id.id == company.id]
            company.sudo().write({'enabled_pillars': ','.join(owned_codes)})

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        records._sync_company_pillars()
        return records

    def write(self, vals):
        res = super().write(vals)
        if any(k in vals for k in ('company_id', 'code', 'sequence', 'active')):
            self._sync_company_pillars()
        return res
