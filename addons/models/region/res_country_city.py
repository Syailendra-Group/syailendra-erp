# -*- coding: utf-8 -*-
from odoo import fields, models


class ResCountryCity(models.Model):
    _name = 'res.country.city'
    _description = 'City / Regency'
    _order = 'name asc'

    name = fields.Char(string='City/Regency Name', required=True, index=True)
    code = fields.Char(string='Official Code', index=True)
    alias = fields.Char(string='Alias Name', index=True)
    description = fields.Text(string='Description')
    country_id = fields.Many2one('res.country', string='Country', required=True)
    state_id = fields.Many2one(
        'res.country.state',
        string='Province / State',
        domain="[('country_id', '=', country_id)]",
        required=True,
        ondelete='restrict'
    )
    latitude = fields.Float(string='Centroid Latitude', digits=(10, 6))
    longitude = fields.Float(string='Centroid Longitude', digits=(10, 6))
    active = fields.Boolean(string='Active', default=True)
