# -*- coding: utf-8 -*-
from odoo import fields, models


class ResCompany(models.Model):
    _inherit = 'res.company'

    short_name = fields.Char(
        string='Entity Short Name / Abbreviation',
        size=30,
        help='Official entity short code (e.g. PT SBI, PT SPBA, PT SAMMEND, PT SG)'
    )
    tagline = fields.Char(
        string='Corporate Tagline',
        help='Business tagline or commodity focus for this corporate entity'
    )
    enabled_pillars = fields.Char(
        string='Enabled Module Pillars',
        default='ftm,hrm,scm',
        help='Comma-separated module pillar IDs enabled for this corporate entity'
    )
    custom_menu_config = fields.Text(
        string='Custom Menu Config (JSON)',
        help='Granular JSON overrides for sub-menus and feature items'
    )
