# -*- coding: utf-8 -*-
{
    'name': 'Syailendra Regional Master',
    'version': '18.0.1.2.0',
    'summary': 'Master data for Regencies, Districts, and Villages with Geographic Centroids and SCM Extensions',
    'description': '''
        Syailendra Group Regional Hierarchy & SCM Foundation:
        - Province (res.country.state) extended with prefix ID, alias, description, and centroid GPS
        - Regency / City (res.country.city) linked to Province with BPS codes and centroid GPS
        - District / Kecamatan (res.country.district) linked to Regency with BPS codes and centroid GPS
        - Subdistrict / Village (res.country.subdistrict) linked to District with Postal Codes and centroid GPS
        - Integration with res.partner for complete farm/plantation addresses, commodities, and agronomy benchmarks
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
