# -*- coding: utf-8 -*-
"""Intake of partner-submitted field reports.

Partners never write to operational tables. Every submission lands here, is
reviewed by staff, and only then promoted into harvest / distillation / shipment
records. Promotion is idempotent: one submission yields at most one record.
"""
from odoo import _, api, fields, models
from odoo.exceptions import AccessError, UserError, ValidationError

KIND_SELECTION = [
    ('farmer_profile', 'Profil & Lahan Petani'),
    ('harvest', 'Catat Panen'),
    ('handover', 'Serah Terima ke Penyuling'),
    ('distillation', 'Laporan Penyulingan'),
    ('shipment', 'Pengiriman ke PT SBI'),
    ('partnership_request', 'Pengajuan Kemitraan'),
]

STATE_SELECTION = [
    ('draft', 'Draf'),
    ('submitted', 'Menunggu Review'),
    ('in_review', 'Sedang Direview'),
    ('needs_revision', 'Perlu Revisi'),
    ('approved', 'Disetujui'),
    ('rejected', 'Ditolak'),
    ('cancelled', 'Dibatalkan'),
]

EDITABLE_STATES = ('draft', 'needs_revision')

# Kontrak kode kesalahan untuk UI (W5): setiap kesalahan di alur submit dan
# promotion ditandai dengan prefix kode stabil, contoh 'E_FARM_MISSING: ...'
# atau 'E_REGION_MISMATCH: ...'. UI memotong alles sampai ': ' pertama dan
# menampilkan sisa pesan (Bahasa Indonesia) kepada pengguna. Prefix kode ini
# adalah Publik API untuk W5 — tidak boleh diubah atau dihapus tanpa rilis
# baru dari UI yang mengacu padanya.
#
# Kode yang digunakan:
#   E_SUBMIT_EMPTY        payload kosong pada action_submit
#   E_SUBMIT_MISSING      field wajib per jenis laporan belum diisi
#   E_SUBMIT_STATE        laporan bukan draf/revisi saat submit
#   E_REVIEW_NOT_SUBMITTED start_review pada laporan non-submitted
#   E_REVIEW_NOTES_REQUIRED catatan revisi kosong
#   E_REVIEW_NOTES_SHORT  catatan revisi di bawah panjang minimum
#   E_REVISION_NOT_ALLOWED revisi pada status yang tidak mengizinkan
#   E_REJECT_NOTES_REQUIRED catatan penolakan kosong
#   E_REJECT_NOTES_SHORT  catatan penolakan di bawah panjang minimum
#   E_REJECT_FINAL        penolakan laporan final
#   E_APPROVE_STATE       approval pada status yang tidak direview
#   E_PROMO_*             gagal promotion (lihat submission_promotion *.py)
KIND_REQUIRED_FIELDS = {
    'farmer_profile': {
        'fields': ['nik', 'name', 'land_area_m2'],
        'nested': {'farm': ['name', 'farming_system']},
    },
    'harvest': {
        'fields': ['farm_id', 'crop_id', 'harvest_date', 'wet_weight_kg'],
    },
    'handover': {
        'fields': ['harvest_id'],
    },
    'distillation': {
        'fields': ['harvest_id', 'product_id', 'distillation_date', 'biomass_input_kg'],
    },
    'shipment': {
        'fields': ['distillation_id', 'shipment_date'],
    },
    'partnership_request': {
        'fields': ['ref', 'supplier_type_id', 'name'],
    },
}

MIN_REVIEW_NOTES = 10


class SyailendraPartnerSubmission(models.Model):
    """A single field report submitted by an upstream partner."""

    _name = 'syailendra.partner.submission'
    _description = 'Laporan Mitra Hulu'
    # Deliberately no mail.thread: the portal writes these rows through the
    # read-only SCM API account, which must never need access to mail.* tables.
    # The review trail lives in state, revision, reviewed_by/at and review_notes.
    _order = 'submitted_at desc, id desc'

    name = fields.Char(
        string='Nomor Laporan', required=True, copy=False, readonly=True, index=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('syailendra.partner.submission'),
    )
    partner_id = fields.Many2one(
        'res.partner', string='Mitra', index=True, ondelete='restrict',
        domain="[('supplier_rank', '>', 0)]",
        help='Kosong hanya untuk pengajuan kemitraan dari calon mitra baru.',
    )
    access_id = fields.Many2one('syailendra.partner.access', string='Akses Portal', ondelete='set null')
    kind = fields.Selection(KIND_SELECTION, string='Jenis Laporan', required=True, index=True)
    payload = fields.Json(string='Isian Lapangan', default=dict)
    state = fields.Selection(
        STATE_SELECTION, string='Status', default='draft', required=True, index=True,
    )
    revision = fields.Integer(string='Revisi Ke', default=1, copy=False)
    submitted_at = fields.Datetime(string='Dikirim Pada', copy=False, index=True)
    reviewed_by = fields.Many2one('res.users', string='Direview Oleh', copy=False)
    reviewed_at = fields.Datetime(string='Direview Pada', copy=False)
    review_notes = fields.Text(string='Catatan Review', copy=False)
    promoted_model = fields.Char(string='Model Hasil', copy=False, readonly=True)
    promoted_id = fields.Integer(string='ID Hasil', copy=False, readonly=True)
    applicant_name = fields.Char(string='Nama Pemohon', help='Diisi pada pengajuan kemitraan.')
    applicant_phone = fields.Char(string='Kontak Pemohon')
    company_id = fields.Many2one(
        'res.company', string='Perusahaan', required=True, index=True,
        default=lambda self: self.env.company,
    )
    active = fields.Boolean(default=True)

    # ------------------------------------------------------------------
    # Ownership guard — the trusted portal server passes the access id it
    # resolved from the signed session; the browser never supplies it.
    # ------------------------------------------------------------------
    def _guard_partner(self, access_id):
        self.ensure_one()
        access = self.env['syailendra.partner.access'].sudo().browse(int(access_id or 0)).exists()
        if not access or not access.active or access.partner_id != self.partner_id:
            raise AccessError(_('Akses portal tidak cocok dengan pemilik laporan ini.'))
        return access

    def _require_manager(self):
        if not self.env.user.has_group('syailendra_scm.group_scm_manager'):
            raise AccessError(_('Hanya SCM Manager yang dapat mereview laporan mitra.'))

    # ------------------------------------------------------------------
    # Structured error codes (kontrak UI W5)
    # ------------------------------------------------------------------
    def _fail(self, code, message):
        """Raise UserError carrying a stable error code for the UI (W5).

        ``code`` is the machine-readable prefix listed in the module contract
        above; it never changes between releases. ``message`` is the
        user-facing Indonesian text. The UI strips everything up to and
        including ': ' before rendering the message to the user.
        """
        raise UserError('%s: %s' % (code, message))

    def _validate_payload_for_kind(self, kind, payload):
        """Daftar kunci wajib yang hilang untuk jenis laporan; kosong jika valid.

        Setiap entri dalam hasil adalah nama kunci top-level payload, atau
        'objek.kunci' untuk field wajib di dalam objek bersarang (contoh
        'farm.farming_system').
        """
        payload = payload or {}
        spec = KIND_REQUIRED_FIELDS.get(kind)
        if not spec:
            return []
        missing = []
        for key in spec.get('fields', []):
            value = payload.get(key)
            if value is None or value == '' or value == [] or value == {}:
                missing.append(key)
        for object_key, sub_keys in (spec.get('nested') or {}).items():
            nested = payload.get(object_key)
            if not isinstance(nested, dict):
                missing.append(object_key)
                continue
            for sub in sub_keys:
                if nested.get(sub) in (None, '', [], {}):
                    missing.append('%s.%s' % (object_key, sub))
        return missing

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('name'):
                vals['name'] = self.env['ir.sequence'].sudo().next_by_code(
                    'syailendra.partner.submission'
                )
            access_id = vals.get('access_id')
            if access_id:
                access = self.env['syailendra.partner.access'].sudo().browse(
                    int(access_id)
                ).exists()
                if not access or not access.active or not access.partner_id:
                    raise AccessError(
                        _('Akses portal tidak valid untuk pembuatan laporan.')
                    )
                # Ownership is derived from the access record; a client-supplied
                # partner_id/company_id can never redirect a submission.
                vals['partner_id'] = access.partner_id.id
                vals['company_id'] = (
                    access.partner_id.company_id.id
                    or access.company_id.id
                    or self.env.company.id
                )
        return super().create(vals_list)

    # Fields a partner may edit through the portal. Everything else (state,
    # promotion result, reviewer identity, timestamps) is staff-only, so a plain
    # write() can never bypass the review state machine.
    PARTNER_EDITABLE_FIELDS = frozenset({
        'payload', 'kind', 'applicant_name', 'applicant_phone',
    })

    def write(self, values):
        # sudo() is an intentional internal elevation used by the guarded
        # partner transitions; the field guard targets real portal callers.
        is_manager = self.env.su or self.env.user.has_group('syailendra_scm.group_scm_manager')
        if not is_manager:
            forbidden = set(values) - self.PARTNER_EDITABLE_FIELDS
            if forbidden:
                raise UserError(_(
                    'Field berikut hanya dapat diubah oleh petugas review: %s'
                ) % ', '.join(sorted(forbidden)))
            if 'payload' in values or 'kind' in values:
                for record in self:
                    if record.state not in EDITABLE_STATES:
                        raise UserError(_('Laporan yang sudah dikirim tidak dapat diubah.'))
        return super().write(values)

    # ------------------------------------------------------------------
    # Partner-side transitions
    # ------------------------------------------------------------------

    # ------------------------------------------------------------------
    # Submit-time ownership of payload links. The owner is the partner of the
    # ACCESS RECORD used for this submit (resolved from the signed session),
    # never a client-supplied partner_id and never the draft row's own field.
    # Unknown or other-partner references are refused before review.
    # ------------------------------------------------------------------
    OWNED_LINKS = {
        'harvest': ('farm_id', 'syailendra.farm', 'E_HARVEST_FARM'),
        'handover': ('harvest_id', 'syailendra.harvest', 'E_HANDOVER_HARVEST'),
        'distillation': ('harvest_id', 'syailendra.harvest', 'E_DISTILLATION_HARVEST'),
        'shipment': ('distillation_id', 'syailendra.distillation', 'E_SHIPMENT_DISTILLATION'),
    }

    def _validate_owned_links(self, owner_partner):
        """Refuse unknown or foreign references before the review queue."""
        rule = self.OWNED_LINKS.get(self.kind)
        if not rule:
            return
        key, model_name, code = rule
        raw = (self.payload or {}).get(key)
        if raw in (None, '', False) or isinstance(raw, bool):
            return
        try:
            target_id = int(raw)
        except (TypeError, ValueError):
            self._fail(code + '_NOT_FOUND', _('Referensi %s tidak valid.') % key)
        target = self.env[model_name].sudo().browse(target_id).exists()
        if not target:
            self._fail(code + '_NOT_FOUND', _('Referensi %s tidak ditemukan.') % key)
        if 'partner_id' in target._fields and target.partner_id != owner_partner:
            self._fail(code + '_FOREIGN', _('Referensi %s bukan milik mitra ini.') % key)

    def action_submit(self, access_id):
        for record in self:
            record._guard_partner(access_id)
            if record.state not in EDITABLE_STATES:
                record._fail('E_SUBMIT_STATE', _('Hanya draf atau laporan yang diminta revisi yang dapat dikirim.'))
            if not record.payload:
                raise ValidationError('E_SUBMIT_EMPTY: %s' % _('Isian laporan masih kosong.'))
            missing = record._validate_payload_for_kind(record.kind, record.payload)
            if missing:
                kind_label = dict(KIND_SELECTION).get(record.kind, record.kind)
                raise ValidationError('E_SUBMIT_MISSING: %s' % _(
                    'Isian laporan tidak lengkap untuk %s. Field wajib yang belum diisi: %s.'
                ) % (kind_label, ', '.join(missing)))
            record._validate_owned_links(record._guard_partner(access_id).partner_id)
            record.sudo().write({
                'state': 'submitted',
                'submitted_at': fields.Datetime.now(),
                'access_id': int(access_id),
                'revision': record.revision + (1 if record.state == 'needs_revision' else 0),
                'review_notes': False,
            })
        return True

    def action_cancel(self, access_id):
        for record in self:
            record._guard_partner(access_id)
            if record.state not in EDITABLE_STATES + ('submitted',):
                raise UserError(_('Laporan yang sudah diproses tidak dapat dibatalkan.'))
            record.sudo().write({'state': 'cancelled'})
        return True

    # ------------------------------------------------------------------
    # Staff-side transitions
    # ------------------------------------------------------------------
    def action_start_review(self):
        self._require_manager()
        for record in self:
            if record.state != 'submitted':
                record._fail('E_REVIEW_NOT_SUBMITTED', _('Hanya laporan berstatus menunggu review yang dapat dibuka.'))
            record.write({
                'state': 'in_review',
                'reviewed_by': self.env.uid,
                'reviewed_at': fields.Datetime.now(),
            })
        return True

    def action_request_revision(self, notes):
        self._require_manager()
        notes = (notes or '').strip()
        if not notes:
            self._fail('E_REVIEW_NOTES_REQUIRED', _('Alasan revisi wajib diisi agar mitra tahu apa yang diperbaiki.'))
        if len(notes) < MIN_REVIEW_NOTES:
            self._fail('E_REVIEW_NOTES_SHORT', _(
                'Catatan review minimal %d karakter agar mitra tahu apa yang diperbaiki.' % MIN_REVIEW_NOTES
            ))
        for record in self:
            if record.state not in ('submitted', 'in_review'):
                record._fail('E_REVISION_NOT_ALLOWED', _('Status laporan tidak mengizinkan permintaan revisi.'))
            record.write({
                'state': 'needs_revision',
                'review_notes': notes,
                'reviewed_by': self.env.uid,
                'reviewed_at': fields.Datetime.now(),
            })
        return True

    def action_reject(self, notes):
        self._require_manager()
        notes = (notes or '').strip()
        if not notes:
            self._fail('E_REJECT_NOTES_REQUIRED', _('Alasan penolakan wajib diisi.'))
        if len(notes) < MIN_REVIEW_NOTES:
            self._fail('E_REJECT_NOTES_SHORT', _('Catatan penolakan minimal %d karakter.' % MIN_REVIEW_NOTES))
        for record in self:
            if record.state in ('approved', 'rejected'):
                record._fail('E_REJECT_FINAL', _('Laporan final tidak dapat ditolak ulang.'))
            record.write({
                'state': 'rejected',
                'review_notes': notes,
                'reviewed_by': self.env.uid,
                'reviewed_at': fields.Datetime.now(),
            })
        return True

    def action_approve(self, links=None):
        """Approve and promote. Implemented in submission_promotion.py."""
        self._require_manager()
        return self._promote(links or {})
