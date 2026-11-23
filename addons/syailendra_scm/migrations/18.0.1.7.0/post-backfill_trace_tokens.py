# -*- coding: utf-8 -*-
"""Isi token ketertelusuran publik untuk lot lama.

Token dibuat acak dan tidak dapat diturunkan dari kode batch, sehingga lot lama
tidak boleh dibiarkan tanpa token maupun berbagi token yang sama: QR akan jatuh
kembali ke kode batch yang mudah ditebak, dan constraint unik tidak akan dapat
dipasang.
"""
import secrets

from odoo import SUPERUSER_ID, api

TOKEN_BYTES = 16


def migrate(cr, version):
    if not version:
        return

    env = api.Environment(cr, SUPERUSER_ID, {})
    lots = env['stock.lot'].with_context(active_test=False).search([])
    seen = set()
    rewritten = 0
    for lot in lots:
        token = lot.public_trace_token
        if token and token not in seen:
            seen.add(token)
            continue
        token = secrets.token_urlsafe(TOKEN_BYTES)
        while token in seen:
            token = secrets.token_urlsafe(TOKEN_BYTES)
        seen.add(token)
        lot.write({'public_trace_token': token})
        rewritten += 1
    if rewritten:
        print('SG-14 F1: %d token lot diisi ulang.' % rewritten)
