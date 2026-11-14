# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError

SCORE_WEIGHTS = {
    'score_quality': 0.30,
    'score_delivery': 0.25,
    'score_communication': 0.15,
    'score_price': 0.15,
    'score_consistency': 0.15,
}


class SyailendraSupplierEvaluation(models.Model):
    """Penilaian berkala kinerja pemasok hulu (Grade A-D)."""

    _name = 'syailendra.supplier.evaluation'
    _description = 'Evaluasi Kinerja Pemasok'
    _order = 'evaluation_date desc, id desc'

    name = fields.Char(
        string='Nomor Evaluasi',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'syailendra.supplier.evaluation'
        ),
        index=True,
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Pemasok',
        required=True,
        index=True,
        domain="[('supplier_rank', '>', 0)]",
    )
    evaluation_date = fields.Date(
        string='Tanggal Evaluasi',
        required=True,
        default=fields.Date.context_today,
        index=True,
    )
    evaluator_name = fields.Char(string='Penilai')

    score_quality = fields.Float(string='Skor Kualitas (30%)', digits=(5, 2))
    score_delivery = fields.Float(string='Skor Pengiriman (25%)', digits=(5, 2))
    score_communication = fields.Float(string='Skor Komunikasi (15%)', digits=(5, 2))
    score_price = fields.Float(string='Skor Harga (15%)', digits=(5, 2))
    score_consistency = fields.Float(string='Skor Konsistensi (15%)', digits=(5, 2))

    total_score = fields.Float(
        string='Skor Total',
        compute='_compute_total_score',
        store=True,
        aggregator='avg',
        digits=(5, 2),
    )
    grade = fields.Selection(
        [
            ('a', 'Grade A'),
            ('b', 'Grade B'),
            ('c', 'Grade C'),
            ('d', 'Grade D'),
        ],
        string='Kategori',
        compute='_compute_total_score',
        store=True,
        index=True,
    )
    notes = fields.Text(string='Catatan & Rekomendasi')

    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    @api.depends(
        'score_quality',
        'score_delivery',
        'score_communication',
        'score_price',
        'score_consistency',
    )
    def _compute_total_score(self):
        for record in self:
            total = 0.0
            for field_name, weight in SCORE_WEIGHTS.items():
                total += (record[field_name] or 0.0) * weight
            record.total_score = round(total, 2)
            if total >= 85:
                record.grade = 'a'
            elif total >= 70:
                record.grade = 'b'
            elif total >= 55:
                record.grade = 'c'
            else:
                record.grade = 'd'

    @api.constrains(
        'score_quality',
        'score_delivery',
        'score_communication',
        'score_price',
        'score_consistency',
    )
    def _check_scores(self):
        for record in self:
            for field_name in SCORE_WEIGHTS:
                value = record[field_name] or 0.0
                if value < 0 or value > 100:
                    raise ValidationError(
                        'Seluruh skor penilaian harus berada pada rentang 0-100.'
                    )

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        records._sync_partner_grade()
        return records

    def write(self, vals):
        result = super().write(vals)
        self._sync_partner_grade()
        return result

    def _sync_partner_grade(self):
        """Sinkronkan grade terbaru ke master pemasok (res.partner)."""
        for record in self:
            latest = self.search(
                [('partner_id', '=', record.partner_id.id)],
                order='evaluation_date desc, id desc',
                limit=1,
            )
            if latest and record.partner_id.supplier_grade != latest.grade:
                record.partner_id.sudo().supplier_grade = latest.grade
