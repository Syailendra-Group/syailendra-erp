# -*- coding: utf-8 -*-
{
    'name': 'Syailendra SCM & Traceability',
    'version': '18.0.1.4.0',
    'summary': 'Rantai pasok atsiri: kebun, penyulingan, panen, QC, audit, dan ketertelusuran batch',
    'description': '''
        Syailendra Group SCM Core Addon (Odoo 18 CE):

        - Master Data   : Komoditas tanaman, kebun/terroir, fasilitas penyulingan
        - Operasional   : Sesi panen lapangan, batch penyulingan (rendemen otomatis)
        - Penjaminan Mutu: Uji laboratorium QC (fisika, kimia, GC-MS) + rilis CoA
        - Ketertelusuran: Ekstensi stock.lot (silsilah hulu-hilir, status karantina)
        - Kepatuhan     : Evaluasi kinerja pemasok (Grade A-D), audit lapangan & CAPA
        - Pemasok       : Ekstensi res.partner (jenis, status, legalitas, ESG)
    ''',
    'author': 'Syailendra Bumi Investama / Kael (octadev)',
    'website': 'https://ddistillers.com',
    'category': 'Supply Chain/Supply Chain',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'product',
        'stock',
        'purchase',
        'syailendra_region',
    ],
    'data': [
        'security/syailendra_scm_groups.xml',
        'security/syailendra_scm_rules.xml',
        'security/ir.model.access.csv',
        'security/scm_api_users.xml',
        'data/ir_sequence_data.xml',
        'data/syailendra_supplier_type_data.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
