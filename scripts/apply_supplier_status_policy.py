#!/usr/bin/env python3
"""Apply the approved supplier-status policy (Fase E / D4).

Policy: a supplier imported from Accurate (its ``comment`` carries the legacy
``Accurate ID`` provenance) and holding a plan-coded ``SUP-*`` ref becomes
``active``. Every other supplier keeps its current status, so hand-managed or
unresolved rows are never touched.

Safety: dry-run by default, ``--apply`` writes, ``--rollback`` reverts only rows
that still hold the value this script wrote. One timestamped artifact per run.

Usage:
    python3 scripts/apply_supplier_status_policy.py            # dry-run
    python3 scripts/apply_supplier_status_policy.py --apply
    python3 scripts/apply_supplier_status_policy.py --rollback
"""

from __future__ import annotations

import argparse
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / 'scripts' / 'output'
MODEL = 'res.partner'
TARGET_STATUS = 'active'
ACCURATE_ID = re.compile(r'Accurate ID:\s*[A-Za-z0-9][A-Za-z0-9.\-]*')
SUP_REF = re.compile(r'SUP-[A-Z]+-\d{3,4}')


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in (ROOT / '.env.local').read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def rpc(base: str, params: dict) -> dict:
    req = urllib.request.Request(base + '/jsonrpc', data=json.dumps({'jsonrpc': '2.0', 'method': 'call', 'params': params, 'id': 1}).encode(),
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as resp:
        payload = json.loads(resp.read())
    if 'error' in payload:
        raise SystemExit('RPC_ERROR ' + json.dumps(payload['error'])[:400])
    return payload['result']


class Odoo:
    def __init__(self) -> None:
        env = load_env()
        self.base = env['ODOO_BASE_URL'].rstrip('/')
        self.db = env['ODOO_DB']
        self.login = env.get('ODOO_USERNAME') or env.get('ODOO_LOGIN', '')
        self.secret = env.get('ODOO_API_KEY') or env.get('ODOO_PASSWORD', '')
        self.uid = rpc(self.base, {'service': 'common', 'method': 'authenticate',
                                   'args': [self.db, self.login, self.secret, {}]})
        if not self.uid:
            raise SystemExit('AUTH_FAILED')

    def call(self, model: str, method: str, args: list, opts: dict | None = None):
        return rpc(self.base, {'service': 'object', 'method': 'execute_kw',
                               'args': [self.db, self.uid, self.secret, model, method, args, opts or {}]})


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--rollback', action='store_true')
    args = parser.parse_args()
    odoo = Odoo()

    if args.rollback:
        newest = sorted(OUTPUT_DIR.glob('status_policy_*.json'))[-1]
        artifact = json.loads(newest.read_text())
        current = {p['id']: p['supplier_status'] for p in odoo.call(MODEL, 'search_read',
                   [[['id', 'in', [r['id'] for r in artifact['rows']]]], ['supplier_status']],
                   {'context': {'active_test': False}})}
        reverted = skipped = 0
        for row in artifact['rows']:
            if current.get(row['id']) == row['after']:
                odoo.call(MODEL, 'write', [[row['id']], {'supplier_status': row['before']}])
                reverted += 1
            else:
                skipped += 1
        print(f'ROLLBACK reverted={reverted} skipped={skipped}')
        return

    partners = odoo.call(MODEL, 'search_read', [[['supplier_rank', '>', 0]], ['id', 'ref', 'comment', 'supplier_status', 'active']],
                         {'context': {'active_test': False}})
    rows, reasons = [], {'already_active': 0, 'not_pending': 0, 'no_provenance': 0, 'no_sup_ref': 0, 'archived': 0}
    for partner in partners:
        status = partner.get('supplier_status') or 'pending'
        if status == TARGET_STATUS:
            reasons['already_active'] += 1
            continue
        if status != 'pending':
            reasons['not_pending'] += 1
            continue
        if not partner.get('active'):
            reasons['archived'] += 1
            continue
        comment = partner.get('comment') or ''
        if not ACCURATE_ID.search(comment):
            reasons['no_provenance'] += 1
            continue
        if not SUP_REF.search(partner.get('ref') or ''):
            reasons['no_sup_ref'] += 1
            continue
        rows.append({'id': partner['id'], 'ref': partner['ref'], 'before': status, 'after': TARGET_STATUS})

    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    mode = 'apply' if args.apply else 'dry-run'
    artifact = {'generated_at': datetime.now(timezone.utc).isoformat(), 'mode': mode,
                'total_suppliers': len(partners), 'to_update': len(rows), 'skipped': reasons, 'rows': rows}
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / f'status_policy_{stamp}.json'
    path.write_text(json.dumps(artifact, ensure_ascii=False, indent=1))
    print(json.dumps({k: artifact[k] for k in ('mode', 'total_suppliers', 'to_update', 'skipped')}, indent=1))
    print(f'ARTIFACT {path}')

    if args.apply:
        for row in rows:
            odoo.call(MODEL, 'write', [[row['id']], {'supplier_status': TARGET_STATUS}])
        print(f'APPLIED rows={len(rows)}')


if __name__ == '__main__':
    main()