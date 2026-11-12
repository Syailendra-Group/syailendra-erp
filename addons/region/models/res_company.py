# -*- coding: utf-8 -*-
from odoo import fields, models


class ResCompany(models.Model):
    _inherit = 'res.company'

    enabled_pillars = fields.Char(
        string='Enabled Module Pillars',
        default='main,ftm,hrm,scm,others',
        help='Comma-separated module pillar IDs enabled for this corporate entity'
    )
    custom_menu_config = fields.Text(
        string='Custom Menu Config (JSON)',
        help='Granular JSON overrides for sub-menus and feature items'
    )
