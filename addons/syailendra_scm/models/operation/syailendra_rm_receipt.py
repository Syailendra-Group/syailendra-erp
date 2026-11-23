# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import UserError, ValidationError

PACKAGING_CONDITIONS = [
    ('good', 'Utuh & Tersegel'),
    ('sealed_broken', 'Segel Rusak'),
    ('leaked', 'Bocor / Rembes'),
    ('damaged', 'Kemasan Penyok / Rusak'),
]


class SyailendraRmReceipt(models.Model):
    """Penerimaan bahan baku (minyak atsiri mentah) di gudang pabrik.

    Model ini mencatat kejadian fisik penerimaan — dokumen, timbangan, kondisi
    kemasan, temuan visual — lalu menerbitkan lot bahan baku berstatus karantina.
    Pergerakan stok dan routing gudang belum dijalankan di sini; itu bagian fase
    operasional berikutnya.
    """

    _name = 'syailendra.rm.receipt'
    _description = 'Penerimaan Bahan Baku'
    _order = 'receipt_date desc, id desc'

    name = fields.Char(
        string='Nomor Penerimaan',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'syailendra.rm.receipt'
        ),
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Pemasok / Penyuling',
        required=True,
        index=True,
        domain="[('supplier_rank', '>', 0)]",
    )
    distillation_id = fields.Many2one(
        'syailendra.distillation',
        string='Batch Penyulingan Asal',
        index=True,
        help='Diisi bila penerimaan ini berasal dari batch suling yang tercatat.',
    )
    distillery_id = fields.Many2one(
        'syailendra.distillery', string='Unit Penyulingan Asal', index=True
    )
    product_id = fields.Many2one(
        'product.product',
        string='Material Diterima',
        required=True,
        index=True,
        domain="[('type', '!=', 'service')]",
    )
    lot_id = fields.Many2one(
        'stock.lot',
        string='Lot Bahan Baku Terbit',
        readonly=True,
        copy=False,
        help='Lot yang diterbitkan otomatis saat penerimaan dikonfirmasi.',
    )
    lot_reference = fields.Char(
        string='Referensi Lot', related='lot_id.name', readonly=True
    )

    po_reference = fields.Char(string='Nomor PO')
    delivery_note_ref = fields.Char(string='Nomor Surat Jalan')
    receipt_date = fields.Date(
        string='Tanggal Terima',
        required=True,
        default=fields.Date.context_today,
        index=True,
    )

    document_qty_kg = fields.Float(string='Kuantitas Dokumen (Kg)', digits=(16, 3))
    actual_qty_kg = fields.Float(string='Kuantitas Timbang (Kg)', digits=(16, 3))
    discrepancy_kg = fields.Float(
        string='Selisih Timbang (Kg)',
        compute='_compute_weights',
        store=True,
        digits=(16, 3),
        help='Kuantitas timbang dikurangi kuantitas dokumen. Negatif berarti kurang.',
    )
    gross_weight_kg = fields.Float(string='Bruto (Kg)', digits=(16, 3))
    tare_weight_kg = fields.Float(string='Tara (Kg)', digits=(16, 3))
    net_weight_kg = fields.Float(
        string='Netto (Kg)', compute='_compute_weights', store=True, digits=(16, 3)
    )

    packaging_condition = fields.Selection(
        PACKAGING_CONDITIONS,
        string='Kondisi Kemasan',
        required=True,
        default='good',
    )
    visual_findings = fields.Text(string='Temuan Visual')
    unboxing_checklist_complete = fields.Boolean(
        string='Checklist Unboxing Lengkap',
        help='Foto empat sisi, resi, segel, dan video unboxing telah diambil.',
    )
    receiving_officer = fields.Char(string='Petugas Penerima')

    state = fields.Selection(
        [('draft', 'Draf'), ('received', 'Diterima'), ('cancelled', 'Dibatalkan')],
        string='Status',
        default='draft',
        required=True,
        index=True,
    )

    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    @api.depends(
        'document_qty_kg',
        'actual_qty_kg',
        'gross_weight_kg',
        'tare_weight_kg',
    )
    def _compute_weights(self):
        for record in self:
            record.discrepancy_kg = record.actual_qty_kg - record.document_qty_kg
            record.net_weight_kg = record.gross_weight_kg - record.tare_weight_kg

    @api.constrains('document_qty_kg', 'actual_qty_kg')
    def _check_quantities(self):
        for record in self:
            if record.document_qty_kg < 0 or record.actual_qty_kg < 0:
                raise ValidationError('Kuantitas penerimaan tidak boleh negatif.')

    @api.constrains('gross_weight_kg', 'tare_weight_kg')
    def _check_weights(self):
        for record in self:
            if record.tare_weight_kg > record.gross_weight_kg:
                raise ValidationError('Tara tidak boleh melebihi bruto.')

    def action_receive(self):
        """Konfirmasi penerimaan dan terbitkan lot bahan baku berstatus karantina."""
        for record in self:
            if record.state == 'cancelled':
                raise UserError('Penerimaan yang dibatalkan tidak dapat dikonfirmasi.')
            record.action_issue_lot()
            record.state = 'received'
        return True

    def action_issue_lot(self):
        """Terbitkan lot bahan baku untuk penerimaan ini. Idempoten."""
        self.ensure_one()
        if self.lot_id:
            return self.lot_id
        if not self.actual_qty_kg:
            raise UserError(
                'Isi kuantitas timbang sebelum menerbitkan lot bahan baku.'
            )
        distillation = self.distillation_id
        harvest = distillation.harvest_id
        lot = self.env['stock.lot'].create(
            {
                'name': self.name,
                'product_id': self.product_id.id,
                'company_id': self.company_id.id,
                'harvest_id': harvest.id if harvest else False,
                'distillation_id': distillation.id if distillation else False,
                'distillery_id': self.distillery_id.id or False,
                'farm_id': harvest.farm_id.id if harvest else False,
                'farmer_id': harvest.partner_id.id if harvest else False,
                'quarantine_state': 'quarantine',
            }
        )
        self.lot_id = lot
        return lot

    def action_cancel(self):
        for record in self:
            if record.lot_id:
                raise UserError(
                    'Penerimaan yang sudah menerbitkan lot tidak dapat dibatalkan.'
                )
            record.state = 'cancelled'
        return True
