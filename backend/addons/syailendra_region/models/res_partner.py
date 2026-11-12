# -*- coding: utf-8 -*-
from odoo import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    city_id = fields.Many2one('res.country.city', string='City/Regency')
    district_id = fields.Many2one('res.country.district', string='District')
    subdistrict_id = fields.Many2one('res.country.subdistrict', string='Subdistrict/Village')
    address_detail = fields.Char(string='Address Detail (Block/RT/RW)')
    address_benchmark = fields.Char(string='Address Benchmark / Field Landmark')
    commodity = fields.Selection([
        ('cengkeh', 'Cengkeh'),
        ('nilam', 'Nilam'),
        ('serai', 'Serai Wangi'),
        ('pala', 'Pala'),
        ('gaharu', 'Gaharu'),
        ('kopi', 'Kopi')
    ], string='Main Commodity', default='cengkeh')
    farming_method = fields.Selection([
        ('organic', 'Organic'),
        ('conventional', 'Conventional')
    ], string='Farming Method', default='organic')
    land_area_m2 = fields.Float(string='Land Area (m²)')
    legacy_code = fields.Char(string='Accurate Legacy Code', index=True)
