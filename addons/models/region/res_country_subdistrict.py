# -*- coding: utf-8 -*-
from odoo import fields, models


class ResCountrySubdistrict(models.Model):
    _name = 'res.country.subdistrict'
    _description = 'Subdistrict / Village'
    _order = 'name asc'

    name = fields.Char(string='Subdistrict/Village Name', required=True, index=True)
    code = fields.Char(string='Official Code', index=True)
    alias = fields.Char(string='Alias Name', index=True)
    description = fields.Text(string='Description')
    district_id = fields.Many2one(
        'res.country.district',
        string='District',
        required=True,
        ondelete='restrict'
    )
    city_id = fields.Many2one(
        'res.country.city',
        string='City/Regency',
        related='district_id.city_id',
        store=True,
        readonly=True
    )
    zip_code = fields.Char(string='Postal Code', index=True)
    latitude = fields.Float(string='Centroid Latitude', digits=(10, 6))
    longitude = fields.Float(string='Centroid Longitude', digits=(10, 6))
    active = fields.Boolean(string='Active', default=True)
