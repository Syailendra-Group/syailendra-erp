# -*- coding: utf-8 -*-
{
    'name': 'Syailendra Regional & Enterprise Core',
    'version': '18.0.1.3.0',
    'summary': 'Regional hierarchy, multi-entity company profiles, dynamic pillars, and SCM partner extensions',
    'description': '''
        Syailendra Group Odoo 18 Core Addon:
        - Region: Country, Province, Regency/City, District, Subdistrict with BPS codes & GPS centroids
        - Company: Multi-entity enabled_pillars and custom_menu_config on res.company
        - Partner: Regional hierarchy, commodity, farming method, and land area on res.partner
    ''',
    'author': 'Syailendra Bumi Investama / Kael (octadev)',
    'website': 'https://ddistillers.com',
    'category': 'Localization / Master Data',
    'license': 'LGPL-3',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
