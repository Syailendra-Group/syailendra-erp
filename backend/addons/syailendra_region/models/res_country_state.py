# -*- coding: utf-8 -*-
from odoo import fields, models


class ResCountryState(models.Model):
    _inherit = 'res.country.state'

    alias = fields.Char(string='Alias Name', index=True)
    prefix = fields.Char(string='Prefix Code', size=10, index=True)
    description = fields.Text(string='Description')
    latitude = fields.Float(string='Centroid Latitude', digits=(10, 6))
    longitude = fields.Float(string='Centroid Longitude', digits=(10, 6))
