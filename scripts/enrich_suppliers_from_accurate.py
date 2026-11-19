#!/usr/bin/env python3
"""Enrich existing SCM suppliers from the Accurate Online export (Fase E / S4a).

Joins ``scripts/daftar-pemasok.xlsx`` to ``res.partner`` through the alphanumeric
Accurate ID stored in the legacy provenance comment (``Accurate ID: <code>``),
then proposes fills for contact, tax, and address fields.

Safety contract (see skill ``odoo-data-backfill``):
* dry-run by default; ``--apply`` writes, ``--rollback`` reverts the latest apply;
* only empty target fields are filled — a non-empty differing value is reported
  as a conflict and never overwritten (human-edit guard);
* one timestamped artifact per apply under ``scripts/output/``;
* ``comment`` is rewritten in the JSON codec shape used by
  ``supplier-metadata.ts`` and always keeps the original provenance text.

Usage:
    python3 scripts/enrich_suppliers_from_accurate.py              # dry-run
    python3 scripts/enrich_suppliers_from_accurate.py --apply      # write
    python3 scripts/enrich_suppliers_from_accurate.py --rollback   # revert own writes
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
import urllib.request
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / 'scripts' / 'daftar-pemasok.xlsx'
OUTPUT_DIR = ROOT / 'scripts' / 'output'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
PARTNER_MODEL = 'res.partner'
FIELDS = ['id', 'ref', 'name', 'comment', 'phone', 'mobile', 'email', 'website', 'vat', 'zip',
          'country_id', 'state_id', 'city_id', 'active']
STATE_ALIASES = {
    'JAWABARAT': 'JAWA BARAT', 'SUMATRA BARAT': 'SUMATERA BARAT', 'SUMATRA UTARA': 'SUMATERA UTARA',
    'SUMATRA SELATAN': 'SUMATERA SELATAN', 'NANGGROE ACEH DARUSSALAM': 'ACEH',
    'BANGKA BELITUNG': 'KEPULAUAN BANGKA BELITUNG', 'JAKARTA': 'DKI JAKARTA', 'YOGYAKARTA': 'DI YOGYAKARTA'
}
TYPE_PREFIXES = ('KABUPATEN ', 'KAB ', 'KOTA ', 'KOTAMADYA ', 'ADM ')


# ---------------------------------------------------------------- env & RPC
def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in (ROOT / '.env.local').read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


class Odoo:
    def __init__(self) -> None:
        env = load_env()
        self.base = env['ODOO_BASE_URL'].rstrip('/')
        self.db = env['ODOO_DB']
        self.login = env.get('ODOO_USERNAME') or env.get('ODOO_LOGIN', '')
        self.secret = env.get('ODOO_API_KEY') or env.get('ODOO_PASSWORD', '')
        self.uid = self._rpc('/jsonrpc', {'service': 'common', 'method': 'authenticate',
                                          'args': [self.db, self.login, self.secret, {}]})
        if not self.uid:
            raise SystemExit('AUTH_FAILED: check ODOO credentials in .env.local')

    def _rpc(self, path: str, params: dict[str, Any]) -> Any:
        body = json.dumps({'jsonrpc': '2.0', 'method': 'call', 'params': params, 'id': 1}).encode()
        req = urllib.request.Request(self.base + path, data=body, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=180) as resp:
            payload = json.loads(resp.read())
        if 'error' in payload:
            raise SystemExit('RPC_ERROR ' + json.dumps(payload['error'])[:600])
        return payload['result']

    def call(self, model: str, method: str, args: list, opts: dict | None = None) -> Any:
        return self._rpc('/jsonrpc', {'service': 'object', 'method': 'execute_kw',
                                      'args': [self.db, self.uid, self.secret, model, method, args, opts or {}]})


# ---------------------------------------------------------------- xlsx
def col_of(ref: str) -> str:
    match = re.match(r'([A-Z]+)', ref)
    return match.group(1) if match else ''


def read_xlsx() -> dict[str, dict[str, str]]:
    with zipfile.ZipFile(XLSX) as archive:
        sheet = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
        rows: list[dict[str, str]] = []
        for row in sheet.findall('.//m:sheetData/m:row', NS):
            cells: dict[str, str] = {}
            for cell in row.findall('m:c', NS):
                inline = cell.find('m:is', NS)
                value = cell.find('m:v', NS)
                if cell.get('t') == 'inlineStr' and inline is not None:
                    text = ''.join(node.text or '' for node in inline.iter('{%s}t' % NS['m']))
                elif value is not None:
                    text = value.text or ''
                else:
                    text = ''
                cells[col_of(cell.get('r') or '')] = text.strip()
            rows.append(cells)
    records = {}
    for cells in rows[1:]:
        code = cells.get('C', '')
        if code:
            records[code] = cells
    return records


# ---------------------------------------------------------------- normalization
def strip_accents(value: str) -> str:
    return unicodedata.normalize('NFKD', value or '').encode('ascii', 'ignore').decode()


def norm_loose(value: str) -> str:
    text = re.sub(r'[^A-Z0-9]+', '', strip_accents(value).upper())
    return text


def match_region(value: str, catalog: dict[str, list[dict]], allow_type_prefix: bool) -> dict | None:
    """Match a free-text region against a normalized catalog. Returns None when
    the value resolves to zero or several candidates (caller reports review)."""
    key = norm_loose(value)
    if not key:
        return None
    direct = catalog.get(key, [])
    if len(direct) == 1:
        return direct[0]
    if direct:
        return None
    prefix = value.strip().upper()
    if allow_type_prefix and not prefix.startswith(TYPE_PREFIXES):
        for candidate_prefix in ('KOTA', 'KABUPATEN'):
            matches = catalog.get((candidate_prefix + key), [])
            if len(matches) == 1:
                return matches[0]
    return None


# ---------------------------------------------------------------- comment codec
def clean_html(raw: str) -> str:
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', raw)).strip()


def parse_comment(raw: str | bool) -> tuple[dict, str]:
    if not raw:
        return {}, ''
    cleaned = clean_html(str(raw))
    if cleaned.startswith('{') and cleaned.endswith('}'):
        try:
            parsed = json.loads(cleaned)
            provenance = str(parsed.pop('provenance', '') or '')
            return parsed, provenance
        except json.JSONDecodeError:
            pass
    return {}, cleaned


def build_comment(metadata: dict, provenance: str) -> str:
    payload = dict(metadata)
    if provenance:
        payload['provenance'] = provenance
    return json.dumps(payload, ensure_ascii=False, separators=(',', ':'))


def accurate_id_of(raw_comment: str | bool) -> str | None:
    _, provenance = parse_comment(raw_comment)
    match = re.search(r'Accurate ID:\s*([A-Za-z0-9][A-Za-z0-9.\-]*)', provenance or str(raw_comment or ''))
    return match.group(1).strip() if match else None


TRAILING_NOTE = re.compile(r'\s*\([^()]*\)\s*$')


def clean_contact(value: str) -> tuple[str, bool]:
    """Strip a trailing free-text note ("(Lama)", "(Hasanudin)") from a phone
    value. Leading parenthesised area codes like "(0271) 717417" are preserved."""
    raw = (value or '').strip()
    cleaned = TRAILING_NOTE.sub('', raw).strip()
    return cleaned, cleaned != raw


# ---------------------------------------------------------------- planning
def is_empty(value: Any) -> bool:
    return value is None or value is False or value == ''


def decide(current: Any, candidate: Any) -> tuple[str, str]:
    """Human-edit guard: fill empty targets, skip equal values, never overwrite."""
    if is_empty(candidate):
        return 'no_source', 'source_empty'
    if is_empty(current):
        return 'fill', 'target_empty'
    if current == candidate:
        return 'skip', 'already_current'
    return 'conflict', 'target_differs'


def match_city(raw: str, state_id: int | None, typed: dict[str, list[dict]], bare: dict[str, list[dict]]) -> tuple[dict | None, str]:
    """Resolve a free-text city against the catalog. Type-aware first (Kota vs
    Kabupaten), then bare name scoped by the resolved province."""
    key = norm_loose(raw)
    direct = typed.get(key, [])
    if len(direct) == 1:
        return direct[0], 'exact'
    if direct:
        scoped = [c for c in direct if state_id and c.get('state_id') and c['state_id'][0] == state_id]
        if len(scoped) == 1:
            return scoped[0], 'exact_scoped'
        return None, 'ambiguous'
    upper = raw.strip().upper()
    if not upper.startswith(TYPE_PREFIXES):
        candidates = bare.get(key, [])
        if state_id:
            scoped = [c for c in candidates if c.get('state_id') and c['state_id'][0] == state_id]
            if len(scoped) == 1:
                return scoped[0], 'bare_scoped'
        if len(candidates) == 1:
            return candidates[0], 'bare'
        if candidates:
            return None, 'ambiguous'
    return None, 'unresolved'


def plan_partner(partner: dict, row: dict[str, str], state_map, city_typed, city_bare, indonesia_id: int | None):
    changes: dict[str, dict[str, Any]] = {}
    notes: list[str] = []

    def propose(field: str, candidate: Any, reason: str = ''):
        action, why = decide(partner.get(field), candidate)
        if action in ('fill', 'conflict'):
            changes[field] = {'before': partner.get(field), 'after': candidate,
                              'action': action, 'reason': reason or why}
        elif action == 'skip' and why == 'already_current':
            notes.append(f'skip|{field}')

    phone_src = (row.get('F') or '').strip()
    mobile_src = (row.get('G') or '').strip()
    phone_src, phone_cleaned = clean_contact(phone_src)
    mobile_src, mobile_cleaned = clean_contact(mobile_src)
    if phone_cleaned or mobile_cleaned:
        notes.append('contact:annotation_stripped')
    legacy_phone = str(partner.get('phone') or '').strip()
    mobile_now = str(partner.get('mobile') or '').strip()

    if mobile_src and not mobile_now:
        propose('mobile', mobile_src, 'accurate_handphone')
    if mobile_src and legacy_phone == mobile_src:
        # The old import merged handphone into phone; move it, keep phone empty or F.
        target = phone_src if phone_src and phone_src != mobile_src else ''
        if legacy_phone != target:
            changes['phone'] = {'before': legacy_phone, 'after': target, 'action': 'move',
                                'reason': 'legacy_phone_was_mobile'}
    elif phone_src:
        propose('phone', phone_src, 'accurate_business_phone')

    propose('vat', (row.get('X') or '').strip(), 'accurate_npwp')
    propose('website', (row.get('J') or '').strip(), 'accurate_website')
    propose('zip', (row.get('Q') or '').strip(), 'accurate_zip')

    country_raw = (row.get('P') or '').strip().upper()
    if country_raw == 'INDONESIA' and indonesia_id:
        propose('country_id', indonesia_id, 'accurate_country_indonesia')
    elif country_raw and country_raw != 'INDONESIA':
        notes.append(f'country:review:{country_raw}')

    province_raw = (row.get('O') or '').strip()
    if province_raw:
        key = STATE_ALIASES.get(norm_literal(province_raw), norm_literal(province_raw))
        candidate = state_map.get(key)
        if candidate:
            propose('state_id', candidate['id'], 'accurate_province')
        else:
            notes.append(f'province:unresolved:{province_raw}')

    city_raw = (row.get('N') or '').strip()
    if city_raw:
        state_id = changes.get('state_id', {}).get('after') or partner.get('state_id')
        if isinstance(state_id, (list, tuple)):
            state_id = state_id[0] if state_id else None
        city, how = match_city(city_raw, state_id, city_typed, city_bare)
        if city:
            propose('city_id', city['id'], f'accurate_city_{how}')
        else:
            notes.append(f'city:{how}:{city_raw}')

    metadata, provenance = parse_comment(partner.get('comment'))
    meta_updates = {'legacyCode': row.get('C', ''), 'paymentTerm': row.get('L', ''),
                    'taxName': row.get('Z', ''), 'nik': row.get('Y', '')}
    meta_changed = {}
    for key, value in meta_updates.items():
        if value and not metadata.get(key):
            meta_changed[key] = value
    if meta_changed:
        new_comment = build_comment({**metadata, **meta_changed}, provenance)
        if new_comment != (partner.get('comment') or ''):
            changes['comment'] = {'before': 'provenance_preserved', 'after': ','.join(sorted(meta_changed)),
                                  'action': 'fill', 'reason': 'accurate_metadata', 'comment': new_comment,
                                  'before_comment': partner.get('comment') or ''}
    return changes, notes


def norm_literal(value: str) -> str:
    text = re.sub(r'[^A-Z0-9]+', ' ', strip_accents(value).upper())
    return re.sub(r'\s+', ' ', text).strip()


# ---------------------------------------------------------------- apply/rollback
def write_changes(odoo: Odoo, partner_id: int, changes: dict[str, dict]) -> None:
    values = {field: payload['after'] for field, payload in changes.items() if field != 'comment'}
    if 'comment' in changes:
        values['comment'] = changes['comment']['comment']
    if values:
        odoo.call(PARTNER_MODEL, 'write', [[partner_id], values], {'context': {'active_test': False}})


def rollback(odoo: Odoo, artifact_path: Path) -> None:
    artifact = json.loads(artifact_path.read_text())
    reverted = skipped = 0
    current = {p['id']: p for p in odoo.call(PARTNER_MODEL, 'search_read',
               [[['id', 'in', [row['partner_id'] for row in artifact['rows']]]], FIELDS],
               {'context': {'active_test': False}})}
    for row in artifact['rows']:
        partner = current.get(row['partner_id'])
        if not partner:
            continue
        values = {}
        for field, payload in row['changes'].items():
            if field == 'comment':
                if (partner.get('comment') or '') == payload['comment']:
                    values['comment'] = payload['before_comment']
                continue
            if partner.get(field) == payload['after']:
                values[field] = payload['before'] if payload['before'] is not None else False
        if values:
            odoo.call(PARTNER_MODEL, 'write', [[row['partner_id']], values], {'context': {'active_test': False}})
            reverted += 1
        else:
            skipped += 1
    print(f'ROLLBACK reverted={reverted} skipped={skipped} artifact={artifact_path.name}')


# ---------------------------------------------------------------- main
def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--rollback', action='store_true')
    args = parser.parse_args()

    odoo = Odoo()
    if args.rollback:
        newest = sorted(OUTPUT_DIR.glob('enrich_plan_*.json'))[-1]
        rollback(odoo, newest)
        return

    xlsx = read_xlsx()
    partners = odoo.call(PARTNER_MODEL, 'search_read', [[['supplier_rank', '>', 0]], FIELDS],
                         {'context': {'active_test': False}})
    states = odoo.call('res.country.state', 'search_read', [[['country_id.code', '=', 'ID']], ['id', 'name']], {})
    cities = odoo.call('res.country.city', 'search_read', [[], ['id', 'name', 'state_id']], {})
    indonesia = odoo.call('res.country', 'search_read', [[['code', '=', 'ID']], ['id']], {})
    indonesia_id = indonesia[0]['id'] if indonesia else None

    state_map = {norm_literal(state['name']): state for state in states}
    city_typed: dict[str, list[dict]] = defaultdict(list)
    city_bare: dict[str, list[dict]] = defaultdict(list)
    for city in cities:
        name = city['name'] or ''
        city_typed[norm_loose(name)].append(city)
        bare = name
        for prefix in TYPE_PREFIXES:
            if bare.upper().startswith(prefix):
                bare = bare[len(prefix):]
                break
        city_bare[norm_loose(bare)].append(city)

    by_code: dict[str, dict] = {}
    for partner in partners:
        code = accurate_id_of(partner.get('comment'))
        if code:
            by_code.setdefault(code, partner)

    rows, unmatched_xlsx, conflicts = [], [], Counter()
    skipped: Counter = Counter()
    field_counts: dict[str, Counter] = defaultdict(Counter)
    unresolved: Counter = Counter()
    for code, partner in by_code.items():
        row = xlsx.get(code)
        if not row:
            unmatched_xlsx.append(code)
            continue
        changes, notes = plan_partner(partner, row, state_map, city_typed, city_bare, indonesia_id)
        for note in notes:
            if note.startswith('skip|'):
                skipped[note[5:]] += 1
            else:
                unresolved[note.split(':')[0] + ':' + note.split(':')[1]] += 1
        for field, payload in changes.items():
            field_counts[field][payload['action']] += 1
            if payload['action'] == 'conflict':
                conflicts[field] += 1
        if changes:
            rows.append({'partner_id': partner['id'], 'ref': partner.get('ref'), 'accurate_id': code,
                         'changes': changes})

    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    mode = 'apply' if args.apply else 'dry-run'
    artifact = {
        'generated_at': datetime.now(timezone.utc).isoformat(), 'mode': mode,
        'xlsx_rows': len(xlsx), 'partners': len(partners), 'joined': len(by_code),
        'xlsx_unmatched_partners': unmatched_xlsx,
        'partners_without_accurate_id': len(partners) - len(by_code),
        'planned_rows': len(rows), 'field_actions': {k: dict(v) for k, v in field_counts.items()},
        'conflicts': dict(conflicts), 'unresolved': dict(unresolved), 'skipped': dict(skipped), 'rows': rows,
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / f'enrich_plan_{stamp}.json'
    path.write_text(json.dumps(artifact, ensure_ascii=False, indent=1))

    print(json.dumps({k: artifact[k] for k in ('mode', 'xlsx_rows', 'partners', 'joined', 'planned_rows',
                                               'xlsx_unmatched_partners', 'partners_without_accurate_id',
                                               'field_actions', 'conflicts', 'unresolved', 'skipped')}, indent=1))
    print(f'ARTIFACT {path}')

    if args.apply:
        for row in rows:
            write_changes(odoo, row['partner_id'], row['changes'])
        print(f'APPLIED rows={len(rows)}')


if __name__ == '__main__':
    main()