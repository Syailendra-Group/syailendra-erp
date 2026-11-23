# -*- coding: utf-8 -*-
import secrets
from urllib.parse import quote_plus

from odoo import api, fields, models

TRACE_TOKEN_BYTES = 16


class StockLot(models.Model):
    """Ekstensi lot/batch menjadi simpul ketertelusuran hulu-hilir."""

    _inherit = 'stock.lot'

    harvest_id = fields.Many2one(
        'syailendra.harvest', string='Lot Panen Asal', index=True
    )
    distillation_id = fields.Many2one(
        'syailendra.distillation', string='Batch Penyulingan Asal', index=True
    )
    distillery_id = fields.Many2one(
        'syailendra.distillery', string='Unit Ketel'
    )
    farmer_id = fields.Many2one('res.partner', string='Petani Mitra', index=True)
    farm_id = fields.Many2one('syailendra.farm', string='Kebun Asal', index=True)

    quarantine_state = fields.Selection(
        [
            ('quarantine', 'Karantina'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        string='Status Karantina Mutu',
        default='quarantine',
        index=True,
    )
    coa_number = fields.Char(string='Nomor CoA')
    active_compound_pct = fields.Float(
        string='Senyawa Aktif GC-MS (%)', digits=(5, 2)
    )
    specific_gravity = fields.Float(string='Berat Jenis (20°C)', digits=(6, 4))
    refractive_index = fields.Float(string='Indeks Bias (20°C)', digits=(6, 4))

    # Tanpa `default=`: Odoo menuliskan nilai default yang sama ke seluruh
    # baris lama saat kolom baru dibuat, sehingga constraint unik mustahil
    # dipasang. Token dibuat di create() dan lot lama diisi post-migration.
    public_trace_token = fields.Char(
        string='Token Ketertelusuran Publik',
        copy=False,
        index=True,
        help='Token acak yang dikodekan ke dalam QR. Tidak dapat diturunkan '
             'dari kode batch, sehingga silsilah tidak dapat dienumerasi.',
    )
    trace_url = fields.Char(
        string='URL Ketertelusuran',
        compute='_compute_trace_url',
        help='URL publik halaman /trace yang ditanam pada label QR.',
    )
    rm_receipt_ids = fields.One2many(
        'syailendra.rm.receipt', 'lot_id', string='Penerimaan Bahan Baku'
    )
    qr_label_ids = fields.One2many(
        'syailendra.qr.label', 'lot_id', string='Riwayat Cetak Label'
    )
    label_count = fields.Integer(string='Jumlah Cetak Label', compute='_compute_label_count')

    traceability_complete = fields.Boolean(
        string='Silsilah Lengkap',
        compute='_compute_traceability_complete',
        store=True,
        help='Bernilai benar bila kebun, petani, dan batch penyulingan tercatat.',
    )

    @api.depends('farm_id', 'farmer_id', 'distillation_id')
    def _compute_traceability_complete(self):
        for lot in self:
            lot.traceability_complete = bool(
                lot.farm_id and lot.farmer_id and lot.distillation_id
            )

    _sql_constraints = [
        (
            'syailendra_lot_trace_token_uniq',
            'unique(public_trace_token)',
            'Token ketertelusuran lot harus unik.',
        ),
    ]

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('public_trace_token'):
                vals['public_trace_token'] = secrets.token_urlsafe(
                    TRACE_TOKEN_BYTES
                )
        return super().create(vals_list)


    @api.depends('public_trace_token')
    def _compute_trace_url(self):
        params = self.env['ir.config_parameter'].sudo()
        base = (
            params.get_param('syailendra.trace.base_url')
            or params.get_param('web.base.url')
            or ''
        ).rstrip('/')
        for lot in self:
            if base and lot.public_trace_token:
                lot.trace_url = '%s/trace/%s' % (base, lot.public_trace_token)
            else:
                lot.trace_url = False

    @api.depends('qr_label_ids')
    def _compute_label_count(self):
        for lot in self:
            lot.label_count = len(lot.qr_label_ids)

    def action_regenerate_trace_token(self):
        for lot in self:
            lot.public_trace_token = secrets.token_urlsafe(TRACE_TOKEN_BYTES)
        return True

    def label_barcode_src(self, width=300, height=300):
        """URL gambar QR untuk laporan label. Nilai di-quote agar URL aman."""
        self.ensure_one()
        value = self.trace_url or self.name or ''
        return '/report/barcode/?barcode_type=QR&value=%s&width=%s&height=%s' % (
            quote_plus(value), width, height,
        )

    def label_meta(self):
        """Nilai tampil label, diambil dari record — tanpa angka karangan."""
        self.ensure_one()
        metadata = self.product_id.product_tmpl_id.atsiri_metadata
        botanical = ''
        if isinstance(metadata, dict):
            botanical = (
                metadata.get('botanical_name')
                or metadata.get('latin_name')
                or ''
            )
        receipt = self.rm_receipt_ids[:1]
        distillation = self.distillation_id
        states = dict(self._fields['quarantine_state'].selection)
        return {
            'product': self.product_id.display_name or '',
            'botanical': botanical,
            'lot': self.name,
            'coa': self.coa_number or '',
            'qc_state': states.get(self.quarantine_state, ''),
            'net_weight_kg': receipt.net_weight_kg if receipt else 0.0,
            'received_on': receipt.receipt_date if receipt else False,
            'produced_on': distillation.distillation_date if distillation else False,
            'trace_url': self.trace_url or '',
            'barcode_src': self.label_barcode_src(),
        }
