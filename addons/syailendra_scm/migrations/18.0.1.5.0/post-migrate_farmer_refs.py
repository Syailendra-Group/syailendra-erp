# -*- coding: utf-8 -*-
"""Give farmers their own FMR-[REGION]-[SEQ] reference (owner decision Q16).

Suppliers keep SUP-*; only partners in the farmer category are renamed. The
province prefix table mirrors src/utils/regional-helper.ts PROVINCE_PREFIXES so
the portal, the importer and the migration agree on the same code shape.
"""
import logging
import re

from odoo import SUPERUSER_ID, api

_logger = logging.getLogger(__name__)

FARMER_CATEGORY = '1.1 Perorangan Petani'

PROVINCE_PREFIXES = {
    'aceh': 'ACH', 'sumatera utara': 'SMU', 'sumatera barat': 'SMB', 'riau': 'RIU',
    'kepulauan riau': 'KRI', 'jambi': 'JMB', 'sumatera selatan': 'SMS',
    'bangka belitung': 'BBL', 'kepulauan bangka belitung': 'BBL', 'bengkulu': 'BKL',
    'lampung': 'LMP', 'dki jakarta': 'JKT', 'jawa barat': 'JBR', 'banten': 'BTN',
    'jawa tengah': 'JTG', 'di yogyakarta': 'DIY', 'jawa timur': 'JTM', 'bali': 'BAL',
    'nusa tenggara barat': 'NTB', 'nusa tenggara timur': 'NTT', 'kalimantan barat': 'KLB',
    'kalimantan tengah': 'KLT', 'kalimantan selatan': 'KLS', 'kalimantan timur': 'KTI',
    'kalimantan utara': 'KLU', 'sulawesi utara': 'SLU', 'gorontalo': 'GTO',
    'sulawesi tengah': 'SLT', 'sulawesi barat': 'SLB', 'sulawesi selatan': 'SLS',
    'sulawesi tenggara': 'STR', 'maluku': 'MAL', 'maluku utara': 'MLU', 'papua': 'PAP',
    'papua barat': 'PBR', 'papua selatan': 'PST', 'papua tengah': 'PTG',
    'papua pegunungan': 'PPG', 'papua barat daya': 'PBD',
}


def province_prefix(name):
    if not name:
        return 'IDN'
    clean = name.lower().strip()
    return PROVINCE_PREFIXES.get(clean, clean[:3].upper())


def migrate(cr, version):
    if not version:
        return
    env = api.Environment(cr, SUPERUSER_ID, {})
    category = env['res.partner.category'].search([('name', '=', FARMER_CATEGORY)], limit=1)
    if not category:
        _logger.info('SG-12 farmer ref migration: category not found, nothing to do')
        return

    farmers = env['res.partner'].with_context(active_test=False).search([
        ('category_id', 'in', category.ids),
        ('supplier_rank', '>', 0),
    ])
    existing = env['res.partner'].with_context(active_test=False).search_read(
        [('ref', '=like', 'FMR-%')], ['ref'],
    )
    counters = {}
    for row in existing:
        match = re.match(r'^FMR-([A-Z]+)-(\d+)$', row['ref'] or '')
        if match:
            prefix, number = match.group(1), int(match.group(2))
            counters[prefix] = max(counters.get(prefix, 0), number)

    renamed = 0
    for farmer in farmers:
        ref = farmer.ref or ''
        if ref.startswith('FMR-'):
            continue
        prefix = province_prefix(farmer.state_id.name)
        counters[prefix] = counters.get(prefix, 0) + 1
        new_ref = 'FMR-%s-%03d' % (prefix, counters[prefix])
        farmer.ref = new_ref
        renamed += 1
        _logger.info('SG-12 farmer ref: %s -> %s (partner %s)', ref, new_ref, farmer.id)

    _logger.info('SG-12 farmer ref migration: %s renamed of %s farmers', renamed, len(farmers))
