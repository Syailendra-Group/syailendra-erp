# -*- coding: utf-8 -*-
from odoo import fields, models


class ResCountryDistrict(models.Model):
    _name = 'res.country.district'
    _description = 'District / Kecamatan'
    _order = 'name asc'

    name = fields.Char(string='District Name', required=True, index=True)
    code = fields.Char(string='Official Code', index=True)
    alias = fields.Char(string='Alias Name', index=True)
    description = fields.Text(string='Description')
    city_id = fields.Many2one(
        'res.country.city',
        string='City/Regency',
        required=True,
        ondelete='restrict'
    )
    state_id = fields.Many2one(
        'res.country.state',
        string='Province / State',
        related='city_id.state_id',
        store=True,
        readonly=True
    )
    country_id = fields.Many2one(
        'res.country',
        string='Country',
        related='city_id.country_id',
        store=True,
        readonly=True
    )
    latitude = fields.Float(string='Centroid Latitude', digits=(10, 6))
    longitude = fields.Float(string='Centroid Longitude', digits=(10, 6))
    active = fields.Boolean(string='Active', default=True)
