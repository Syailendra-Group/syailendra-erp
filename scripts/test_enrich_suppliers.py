#!/usr/bin/env python3
"""Offline unit tests for the S4a enrichment planner (no network, no Odoo).

Run: python3 -m unittest scripts/test_enrich_suppliers.py -v
"""
from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parent / 'enrich_suppliers_from_accurate.py'
spec = importlib.util.spec_from_file_location('enrich', MODULE_PATH)
enrich = importlib.util.module_from_spec(spec)
sys.modules['enrich'] = enrich
spec.loader.exec_module(enrich)


class DecideTests(unittest.TestCase):
    def test_fill_when_target_empty(self):
        self.assertEqual(enrich.decide(False, '0812'), ('fill', 'target_empty'))
        self.assertEqual(enrich.decide('', '0812'), ('fill', 'target_empty'))
        self.assertEqual(enrich.decide(None, 100), ('fill', 'target_empty'))

    def test_skip_when_equal(self):
        self.assertEqual(enrich.decide('0812', '0812'), ('skip', 'already_current'))
        self.assertEqual(enrich.decide(100, 100), ('skip', 'already_current'))

    def test_conflict_never_overwrites(self):
        self.assertEqual(enrich.decide('0812', '0813'), ('conflict', 'target_differs'))

    def test_no_source(self):
        self.assertEqual(enrich.decide(False, ''), ('no_source', 'source_empty'))
        self.assertEqual(enrich.decide(False, None), ('no_source', 'source_empty'))


class ProvenanceTests(unittest.TestCase):
    HTML = '<p>Accurate ID: ABD-DMK | Kategori: 1.1 PERORANGAN_PENYULING | Source: daftar-pemasok.xlsx</p>'

    def test_accurate_id_from_html(self):
        self.assertEqual(enrich.accurate_id_of(self.HTML), 'ABD-DMK')

    def test_accurate_id_from_json_provenance(self):
        raw = '{"legacyCode":"ABD-DMK","provenance":"Accurate ID: ABD-DMK | Kategori: 1.1"}'
        self.assertEqual(enrich.accurate_id_of(raw), 'ABD-DMK')

    def test_malformed_json_falls_back_to_text(self):
        raw = '{"broken": '
        self.assertIsNone(enrich.accurate_id_of(raw))

    def test_comment_roundtrip_keeps_unknown_keys(self):
        metadata, provenance = enrich.parse_comment(self.HTML)
        self.assertEqual(metadata, {})
        self.assertIn('Accurate ID: ABD-DMK', provenance)
        built = enrich.build_comment({**metadata, 'legacyCode': 'ABD-DMK', 'paymentTerm': 'COD'}, provenance)
        again_meta, again_prov = enrich.parse_comment(built)
        self.assertEqual(again_meta['legacyCode'], 'ABD-DMK')
        self.assertEqual(again_prov, provenance)

    def test_build_comment_preserves_foreign_keys(self):
        raw = '{"unknownKey":"x","provenance":"Accurate ID: ZZZ-1"}'
        meta, prov = enrich.parse_comment(raw)
        built = enrich.build_comment({**meta, 'taxName': 'PT X'}, prov)
        meta2, _ = enrich.parse_comment(built)
        self.assertEqual(meta2['unknownKey'], 'x')
        self.assertEqual(meta2['taxName'], 'PT X')


class ContactTests(unittest.TestCase):
    def test_trailing_note_stripped(self):
        self.assertEqual(enrich.clean_contact('+62 822-2667-2453 (Lama)'), ('+62 822-2667-2453', True))
        self.assertEqual(enrich.clean_contact('+62 898-4666-661 (Hasanudin)'), ('+62 898-4666-661', True))

    def test_area_code_preserved(self):
        self.assertEqual(enrich.clean_contact('(0271) 717417'), ('(0271) 717417', False))


class CityMatchTests(unittest.TestCase):
    TYPED = {
        'KOTABANDUNG': [{'id': 1, 'state_id': [9, 'Jawa Barat']}],
        'KABUPATENBANDUNG': [{'id': 2, 'state_id': [9, 'Jawa Barat']}],
        'KOTADENPASAR': [{'id': 3, 'state_id': [5, 'Bali']}],
    }
    BARE = {
        'BANDUNG': [{'id': 1, 'state_id': [9, 'Jawa Barat']}, {'id': 2, 'state_id': [9, 'Jawa Barat']}],
        'DENPASAR': [{'id': 3, 'state_id': [5, 'Bali']}],
    }

    def test_typed_exact(self):
        city, how = enrich.match_city('Kota Bandung', 9, self.TYPED, self.BARE)
        self.assertEqual((city['id'], how), (1, 'exact'))

    def test_bare_single(self):
        city, how = enrich.match_city('Denpasar', None, self.TYPED, self.BARE)
        self.assertEqual((city['id'], how), (3, 'bare'))

    def test_bare_ambiguous(self):
        city, how = enrich.match_city('Bandung', None, self.TYPED, self.BARE)
        self.assertIsNone(city)
        self.assertEqual(how, 'ambiguous')

    def test_unresolved(self):
        city, how = enrich.match_city('Atlantis', None, self.TYPED, self.BARE)
        self.assertIsNone(city)
        self.assertEqual(how, 'unresolved')


class RegionNormalizationTests(unittest.TestCase):
    def test_alias_and_loose_key(self):
        self.assertEqual(enrich.norm_literal('Jawa Barat'), 'JAWA BARAT')
        self.assertEqual(enrich.norm_loose('Kota Adm. Jakarta Barat'), 'KOTAADMJAKARTABARAT')
        self.assertEqual(enrich.norm_loose('Kab. Gunungkidul'), 'KABGUNUNGKIDUL')


if __name__ == '__main__':
    unittest.main(verbosity=2)