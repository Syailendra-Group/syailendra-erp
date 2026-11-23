# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import UserError

#: Preset label yang disetujui untuk fase pertama. Pallet dan karton outer
#: sengaja belum dibuka: keduanya butuh data agregat yang belum ada.
LABEL_PRESETS = [
    ('vial_sample', 'Vial Sampel'),
    ('rm_drum', 'Drum / Jerigen Bahan Baku'),
    ('fg_retail', 'Botol Retail'),
]

#: Pemetaan preset ke aksi laporan QWeb. Nilai adalah XML ID lengkap.
REPORT_BY_PRESET = {
    'vial_sample': 'syailendra_scm.action_report_label_vial',
    'rm_drum': 'syailendra_scm.action_report_label_drum',
    'fg_retail': 'syailendra_scm.action_report_label_retail',
}


class SyailendraQrLabel(models.Model):
    """Registri cetak label QR.

    Satu baris merekam satu peristiwa cetak untuk satu lot, sehingga cetak ulang
    dapat diaudit (siapa, kapan, preset apa, berapa lembar). Baris ini bukan
    sumber identitas lot; identitas tetap pada ``stock.lot``.
    """

    _name = 'syailendra.qr.label'
    _description = 'Registri Cetak Label QR'
    _order = 'printed_at desc, id desc'

    name = fields.Char(
        string='Nomor Cetak',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'syailendra.qr.label'
        ),
        index=True,
    )
    lot_id = fields.Many2one(
        'stock.lot', string='Lot / Batch', required=True, index=True
    )
    preset = fields.Selection(
        LABEL_PRESETS, string='Preset Label', required=True, default='rm_drum'
    )
    label_count = fields.Integer(string='Jumlah Lembar', required=True, default=1)
    printed_by = fields.Many2one(
        'res.users',
        string='Dicetak Oleh',
        default=lambda self: self.env.user,
        readonly=True,
    )
    printed_at = fields.Datetime(
        string='Waktu Cetak', default=fields.Datetime.now, readonly=True
    )
    payload_url = fields.Char(
        string='URL Publik',
        related='lot_id.trace_url',
        readonly=True,
        help='URL yang dikodekan ke dalam QR. Berisi token acak, bukan kode batch.',
    )
    notes = fields.Text(string='Catatan Cetak')

    active = fields.Boolean(string='Aktif', default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Perusahaan',
        default=lambda self: self.env.company,
        required=True,
        index=True,
    )

    @api.constrains('label_count')
    def _check_label_count(self):
        for record in self:
            if record.label_count <= 0:
                raise UserError('Jumlah lembar label harus lebih besar dari 0.')

    def action_print_label(self):
        """Kembalikan aksi laporan QWeb untuk preset label baris ini."""
        self.ensure_one()
        if not self.lot_id.public_trace_token:
            raise UserError(
                'Lot %s belum memiliki token ketertelusuran. Terbitkan token '
                'terlebih dahulu sebelum mencetak label.' % self.lot_id.name
            )
        xml_id = REPORT_BY_PRESET.get(self.preset)
        if not xml_id:
            raise UserError('Preset label tidak dikenal: %s' % self.preset)
        report = self.env.ref(xml_id)
        return report.report_action(self.lot_id, config=False)
