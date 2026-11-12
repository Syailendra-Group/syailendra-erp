# -*- coding: utf-8 -*-
from odoo import fields, models


class ResCountry(models.Model):
    _inherit = 'res.country'

    latitude = fields.Float(string='Centroid Latitude', digits=(10, 6))
    longitude = fields.Float(string='Centroid Longitude', digits=(10, 6))
