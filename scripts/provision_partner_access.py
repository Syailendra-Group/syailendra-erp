#!/usr/bin/env python3
"""Provisioning plan for partner portal accesses (res.partner + syailendra.partner.access).
Reads the upstream master from a repo artifact (JSON/JSONL under scripts/) or an Odoo clone via READ-ONLY XML-RPC,
validates duplicates and province/city region pairs, then emits a JSON/CSV report of what would be created/skipped.
Default: read-only dry-run, zero network, zero DB writes, no production touch.
--apply requires --odoo pointing at a non-production clone; PINs are never generated here (portal manager issues them via action_generate_pin).
"""
from __future__ import annotations

import argparse, csv, glob, json, sys, urllib.parse, urllib.request, xmlrpc.client
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

ROLE_FARMER='farmer'; ROLE_DISTILLER='distiller'
CODE_PREFIX={ROLE_FARMER:'FMR', ROLE_DISTILLER:'SUP'}
REPO_ROOT=Path(__file__).resolve().parent; ENV_PATH=REPO_ROOT.parent/'.env.local'
PLAN_GLOB='output/supplier_type_migration_plan_*.json'
NS='{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

def default_master():
    files=sorted(glob.glob(str(REPO_ROOT/PLAN_GLOB)))
    return files[-1] if files else str(REPO_ROOT/'daftar-pemasok.xlsx')

def read_env(path):
    env={}
    if path.is_file():
        for line in path.read_text(encoding='utf-8',errors='replace').splitlines():
            line=line.strip()
            if line and not line.startswith('#') and '=' in line:
                k,v=line.split('=',1); env[k.strip()]=v.strip().strip('"').strip("'")
    return env

def read_rows_jsonl(path):
    out=[]
    for line in path.read_text(encoding='utf-8').splitlines():
        line=line.strip()
        if not line: continue
        data=json.loads(line); out.append({str(k):('' if v is None else str(v)) for k,v in data.items()})
    return out

def read_plan_json(path):
    data=json.loads(path.read_text(encoding='utf-8'))
    entries=data.get('entries',data if isinstance(data,list) else [])
    return [{'ref':str(e.get('ref') or ''),'name':str(e.get('partner_name') or ''),'province':'','city':'','kategori':str(e.get('matched_prefix') or '')} for e in entries]

def read_master(path):
    s=path.suffix.lower()
    if s=='.json': return read_plan_json(path)
    if s=='.jsonl': return read_rows_jsonl(path)
    raise ValueError(f'unsupported master format: {s}')

def normalize_items(rows, source_json):
    items=[]
    for row in rows:
        cat=str(row.get('kategori') or row.get('matched_prefix') or '').strip().split(' ')[0]
        if not source_json and not cat.startswith('1'): continue
        items.append({'role':ROLE_DISTILLER if cat=='1.2' else ROLE_FARMER,'ref':str(row.get('ref') or '').strip(),'name':str(row.get('nama') or row.get('name') or '').strip(),'province':str(row.get('provinsi') or row.get('province') or '').strip(),'city':str(row.get('kota') or row.get('city') or '').strip()})
    return items

def validate_item(item):
    if not item['name']: return ['name is required']
    if len(item['name'])<2: return ['name must be at least 2 characters']
    return []

class OdooReadOnly:
    def __init__(self,url,db,user,password):
        base=f'{urllib.parse.urlparse(url).scheme}://{urllib.parse.urlparse(url).netloc}'
        self.common=xmlrpc.client.ServerProxy(f'{base}/xmlrpc/2/common',allow_none=True)
        self.uid=self.common.authenticate(db,user,password,{})
        self.models=xmlrpc.client.ServerProxy(f'{base}/xmlrpc/2/object',allow_none=True)
        self.db,self.user,self.password=db,user,password
    def search_read(self,model,domain,fields,**kwargs):
        return self.models.execute_kw(self.db,self.uid,self.password,model,'search_read',[domain,fields],kwargs)

def region_ok(odoo,province,city):
    if odoo is None or not province or not city: return None
    try:
        states=odoo.search_read('res.country.state',[['name','=',province]],['id'],limit=1)
        if not states: return None
        cities=odoo.search_read('res_country_city',[['name','=',city],['state_id','=',states[0]['id']]],['id'],limit=1)
        return bool(cities)
    except Exception: return None

def build_plan(items,odoo):
    existing_codes=set(); existing_refs=set()
    if odoo is not None:
        try: existing_codes={str(r['access_code']) for r in odoo.search_read('syailendra.partner.access',[],['access_code']) if r.get('access_code')}
        except Exception: pass
        try: existing_refs={str(r['ref']) for r in odoo.search_read('res.partner',[],['ref']) if r.get('ref')}
        except Exception: pass
    seq={ROLE_FARMER:0,ROLE_DISTILLER:0}; seen_key=set(); seen_code=set(existing_codes)
    plan_items=[]; validation_errors=[]; region_unverified=0
    for row_no,item in enumerate(items,start=2):
        errs=validate_item(item)
        if errs: validation_errors.append({'row':row_no,'role':item['role'],'ref':item['ref'],'errors':errs})
        ok=region_ok(odoo,item['province'],item['city'])
        if ok is None: region_unverified+=1
        key=(item['name'].lower(),item['province'].lower(),item['city'].lower())
        code=item['ref'] or None
        if not code:
            seq[item['role']]+=1; code=f"{CODE_PREFIX[item['role']]}-{seq[item['role']]:03d}"
            while code in seen_code:
                seq[item['role']]+=1; code=f"{CODE_PREFIX[item['role']]}-{seq[item['role']]:03d}"
        status,reason='create',''
        if key in seen_key: status,reason='skip','duplicate within input (name + province + city)'
        elif code in seen_code or (item['ref'] and item['ref'] in existing_refs): status,reason='skip','already exists in target'
        elif errs: status,reason='skip','validation failed: '+' ; '.join(errs)
        elif ok is False: status,reason='skip','invalid region (city not in province)'
        seen_key.add(key); seen_code.add(code)
        plan_items.append({'row':row_no,'role':item['role'],'ref':item['ref'],'code':code,'province':item['province'],'city':item['city'],'region_ok':ok,'status':status,'reason':reason})
    will_create=[it for it in plan_items if it['status']=='create']; will_skip=[it for it in plan_items if it['status']=='skip']
    return {'total_input':len(items),'roles':{ROLE_FARMER:sum(1 for it in plan_items if it['role']==ROLE_FARMER),ROLE_DISTILLER:sum(1 for it in plan_items if it['role']==ROLE_DISTILLER)},'will_create':len(will_create),'will_skip':len(will_skip),'skip_reasons':{'dup_input':sum(1 for it in will_skip if it['reason'].startswith('duplicate')),'exists':sum(1 for it in will_skip if it['reason']=='already exists in target'),'validation':sum(1 for it in will_skip if it['reason'].startswith('validation')),'region':sum(1 for it in will_skip if it['reason']=='invalid region (city not in province)')},'validation_errors':validation_errors,'validation_error_count':len(validation_errors),'region_unverified':region_unverified,'items':plan_items}

def write_reports(report,out_dir):
    stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'); out_dir.mkdir(parents=True,exist_ok=True)
    json_path=out_dir/f'partner_access_provision_{stamp}.json'; csv_path=out_dir/f'partner_access_provision_{stamp}.csv'
    json_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    with csv_path.open('w',encoding='utf-8',newline='') as fh:
        w=csv.writer(fh); w.writerow(['row','role','ref','code','province','city','region_ok','status','reason'])
        for it in report['items']: w.writerow([it['row'],it['role'],it['ref'],it['code'],it['province'],it['city'],it['region_ok'],it['status'],it['reason']])
    return str(json_path),str(csv_path)

def apply_to_clone(odoo,will_create):
    written,errors=0,[]; country_id=None
    try:
        countries=odoo.search_read('res.country',[['name','=','Indonesia']],['id'],limit=1); country_id=countries[0]['id'] if countries else None
    except Exception: country_id=None
    for it in will_create:
        partner_id=None
        try:
            if it['ref']:
                found=odoo.search_read('res.partner',[['ref','=',it['ref']]],['id'],limit=1); partner_id=found[0]['id'] if found else None
        except Exception: found=[]
        if partner_id is None:
            state_id=None
            try:
                states=odoo.search_read('res.country.state',[['name','=',it['province']]],['id'],limit=1); state_id=states[0]['id'] if states else None
            except Exception: state_id=None
            vals={'name':f"partner-{it['code']}",'ref':it['ref'] or it['code'],'city':it['city'],'supplier_rank':1}
            if state_id is not None: vals['state_id']=state_id
            if country_id is not None: vals['country_id']=country_id
            try: partner_id=int(odoo.models.execute_kw(odoo.db,odoo.uid,odoo.password,'res.partner','create',[vals]))
            except Exception as exc: errors.append({'code':it['code'],'error':str(exc)}); continue
        try: odoo.models.execute_kw(odoo.db,odoo.uid,odoo.password,'syailendra.partner.access','create',[{'partner_id':partner_id,'access_code':it['code'],'role':it['role']}]); written+=1
        except Exception as exc: errors.append({'code':it['code'],'error':str(exc)})
    return {'written':written,'errors':errors}

def main():
    p=argparse.ArgumentParser(description='Idempotent provisioning plan for partner portal accesses (dry-run by default).')
    p.add_argument('--master',default=default_master(),help='Master JSON/JSONL (default: latest scripts/output/supplier_type_migration_plan_*.json)')
    p.add_argument('--odoo',default=None,help='URL Odoo klon READ-ONLY (duplikat + wilayah). Tanpa tulisan kecuali --apply.')
    p.add_argument('--apply',action='store_true',help='Tulis ke klon --odoo. Ditolak bila target produksi.')
    p.add_argument('--out-dir',default='scripts/output',help='Direktori laporan (default: scripts/output)')
    a=p.parse_args(); env=read_env(ENV_PATH)
    odoo=OdooReadOnly(a.odoo,env.get('ODOO_DB',''),env.get('ODOO_USERNAME',''),env.get('ODOO_PASSWORD','')) if a.odoo else None
    mp=Path(a.master); items=normalize_items(read_master(mp),mp.suffix.lower()=='.json'); plan=build_plan(items,odoo)
    report={'generated_at':datetime.now(timezone.utc).isoformat(),'dry_run':not a.apply,'source':str(mp),'target_clone':a.odoo,'total_input':plan['total_input'],'roles':plan['roles'],'will_create':plan['will_create'],'will_skip':plan['will_skip'],'skip_reasons':plan['skip_reasons'],'validation_errors':plan['validation_errors'],'validation_error_count':plan['validation_error_count'],'region_unverified':plan['region_unverified'],'items':plan['items']}
    jp,cp=write_reports(report,Path(a.out_dir))
    print('provision_partner_access (dry-run)' if not a.apply else 'provision_partner_access (apply)')
    print(f"  source        : {report['source']}")
    print(f"  total input   : {report['total_input']}  (farmer={plan['roles'][ROLE_FARMER]}, distiller={plan['roles'][ROLE_DISTILLER]})")
    print(f"  will create   : {report['will_create']}")
    print(f"  will skip     : {report['will_skip']}  ({plan['skip_reasons']})")
    print(f"  validation err: {report['validation_error_count']}  region unverified: {report['region_unverified']}")
    print(f"  report json   : {jp}")
    print(f"  report csv    : {cp}")
    if a.apply:
        if not a.odoo: print('ERROR: --apply requires --odoo',file=sys.stderr); return 2
        ph=urllib.parse.urlparse(env.get('ODOO_BASE_URL','')).hostname; th=urllib.parse.urlparse(a.odoo).hostname
        if ph and th==ph: print('ERROR: refusing write to production Odoo host',file=sys.stderr); return 2
        r=apply_to_clone(odoo,[it for it in plan['items'] if it['status']=='create']); report['applied']=r
        jp.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        print(f"  applied wrote : {r['written']}  errors: {len(r['errors'])}")
        if r['errors']: return 1
    return 0

if __name__=='__main__': sys.exit(main())
