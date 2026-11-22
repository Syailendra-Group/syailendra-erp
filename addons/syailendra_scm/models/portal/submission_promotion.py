# -*- coding: utf-8 -*-
"""Promotion of reviewed submissions into operational records (upstream side).

Rules honoured here:
* idempotent — a submission already promoted returns its existing record;
* never invent business values — a missing mandatory master link raises instead
  of defaulting (owner decision Q8: the reviewer completes the gap);
* harvest lots from different regions are never merged (SOP-02).

Kontrak kode kesalahan (UI W5): setiap UserError di bawah ini dibawa prefix
stabil 'E_*: ...' yang cocok dengan yang didefinisikan di
syailendra_partner_submission.py. UI memotong alles sampai ': ' pertama dan
menampilkan sisa pesan (Bahasa Indonesia) kepada pengguna.
"""
from odoo import _, fields, models
from odoo.exceptions import UserError

FARMER_PARTNER_FIELDS = (
    'name', 'nik', 'mobile', 'phone', 'street', 'address_detail', 'address_benchmark',
    'country_id', 'state_id', 'city_id', 'district_id', 'subdistrict_id', 'zip',
    'land_area_m2', 'partner_latitude', 'partner_longitude',
)
FARM_FIELDS = (
    'name', 'area_ha', 'elevation_mdpl', 'latitude', 'longitude', 'farming_system',
    'land_ownership', 'estimated_yield_kg', 'water_source', 'land_history',
    'country_id', 'state_id', 'city_id', 'district_id', 'subdistrict_id',
    'uses_pesticide', 'pesticide_types', 'uses_herbicide', 'herbicide_types', 'fertilizer_types',
)
HARVEST_FIELDS = (
    'harvest_date', 'wet_weight_kg', 'harvest_condition', 'initial_moisture_pct',
    'quality_notes', 'operator_name', 'planted_date', 'pretreatment',
    'origin_latitude', 'origin_longitude', 'source_farmer_name',
    'received_at_distillery_date',
)


class SyailendraPartnerSubmissionPromotion(models.Model):
    _inherit = 'syailendra.partner.submission'

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _value(links, payload, key, default=None):
        if key in links and links[key] not in (None, False, ''):
            return links[key]
        value = (payload or {}).get(key)
        return default if value in (None, False, '') else value

    def _require_value(self, links, payload, key, label):
        value = self._value(links, payload, key)
        if value in (None, False, ''):
            self._fail('E_PROMO_LINK_MISSING', _('%s belum tersedia. Lengkapi saat review sebelum menyetujui.') % label)
        return value

    def _project(self, source, allowed):
        return {key: source[key] for key in allowed if key in source and source[key] not in (None, '')}

    def _promote(self, links):
        handlers = {
            'farmer_profile': self._promote_farmer_profile,
            'harvest': self._promote_harvest,
            'handover': self._promote_handover,
            'distillation': self._promote_distillation,
            'shipment': self._promote_shipment,
            'partnership_request': self._promote_partnership_request,
        }
        for record in self:
            if record.state == 'approved' and record.promoted_id:
                continue  # idempotent: already promoted
            if record.state not in ('submitted', 'in_review'):
                record._fail('E_PROMO_STATE_NOT_REVIEWED', _('Hanya laporan yang direview yang dapat disetujui.'))
            handler = handlers.get(record.kind)
            if not handler:
                record._fail('E_PROMO_UNKNOWN_KIND', _('Jenis laporan tidak dikenal.'))
            model_name, record_id = handler(record, links.get(str(record.id), links) or {})
            record.write({
                'state': 'approved',
                'promoted_model': model_name,
                'promoted_id': record_id,
                'reviewed_by': self.env.uid,
                'reviewed_at': fields.Datetime.now(),
            })
        return True

    # ------------------------------------------------------------------
    # Farmer profile -> res.partner + syailendra.farm
    # ------------------------------------------------------------------
    def _promote_farmer_profile(self, record, links):
        payload = record.payload or {}
        partner = record.partner_id
        if not partner:
            record._fail('E_FARM_MISSING', _('Laporan profil harus tertaut ke mitra terdaftar.'))
        partner_values = self._project(payload, FARMER_PARTNER_FIELDS)
        if partner_values:
            partner.write(partner_values)

        farm_payload = payload.get('farm') or {}
        farm_id = self._value(links, farm_payload, 'farm_id')
        farm_values = self._project(farm_payload, FARM_FIELDS)
        area_m2 = payload.get('land_area_m2')
        if area_m2 and not farm_values.get('area_ha'):
            farm_values['area_ha'] = float(area_m2) / 10000.0
        Farm = self.env['syailendra.farm']
        if farm_id:
            farm = Farm.browse(int(farm_id)).exists()
            if not farm or farm.partner_id != partner:
                record._fail('E_FARM_FOREIGN', _('Kebun yang dipilih bukan milik mitra ini.'))
            if farm_values:
                farm.write(farm_values)
        else:
            if not farm_values.get('name'):
                farm_values['name'] = _('Lahan %s') % partner.name
            if not farm_values.get('farming_system'):
                record._fail('E_FARM_SYSTEM_REQUIRED', _('Sistem budidaya belum diisi. Lengkapi saat review.'))
            crop_ids = self._value(links, farm_payload, 'crop_ids') or []
            farm_values.update({'partner_id': partner.id, 'company_id': record.company_id.id})
            if crop_ids:
                farm_values['crop_ids'] = [(6, 0, [int(c) for c in crop_ids])]
            farm = Farm.create(farm_values)
        return 'syailendra.farm', farm.id

    # ------------------------------------------------------------------
    # Harvest -> syailendra.harvest
    # ------------------------------------------------------------------
    def _promote_harvest(self, record, links):
        payload = record.payload or {}
        farm_id = self._require_value(links, payload, 'farm_id', _('Kebun asal'))
        crop_id = self._require_value(links, payload, 'crop_id', _('Komoditas'))
        farm = self.env['syailendra.farm'].browse(int(farm_id)).exists()
        if not farm or farm.partner_id != record.partner_id:
            record._fail('E_HARVEST_FOREIGN', _('Kebun asal bukan milik mitra ini.'))
        values = self._project(payload, HARVEST_FIELDS)
        for mandatory in ('harvest_date', 'wet_weight_kg'):
            if not values.get(mandatory):
                record._fail('E_HARVEST_INCOMPLETE', _('Data panen wajib (%s) belum lengkap.') % mandatory)
        if float(values['wet_weight_kg']) <= 0:
            record._fail('E_HARVEST_WEIGHT_INVALID', _('Berat panen harus lebih besar dari nol.'))
        values.update({
            'partner_id': record.partner_id.id,
            'farm_id': farm.id,
            'crop_id': int(crop_id),
            'company_id': record.company_id.id,
            'state': 'draft',
        })
        harvest = self.env['syailendra.harvest'].create(values)
        return 'syailendra.harvest', harvest.id

    # ------------------------------------------------------------------
    # Handover -> harvest.state = delivered
    # ------------------------------------------------------------------
    def _promote_handover(self, record, links):
        payload = record.payload or {}
        harvest_id = self._require_value(links, payload, 'harvest_id', _('Lot panen'))
        harvest = self.env['syailendra.harvest'].browse(int(harvest_id)).exists()
        if not harvest:
            record._fail('E_HANDOVER_HARVEST_MISSING', _('Lot panen tidak ditemukan.'))
        if harvest.partner_id != record.partner_id:
            record._fail('E_HANDOVER_FOREIGN', _('Lot panen bukan milik mitra ini.'))
        if harvest.state == 'cancelled':
            record._fail('E_HANDOVER_CANCELLED', _('Lot panen yang dibatalkan tidak dapat diserahkan.'))
        values = {'state': 'delivered'}
        received = payload.get('received_at_distillery_date')
        if received:
            values['received_at_distillery_date'] = received
        if payload.get('handover_weight_kg'):
            values['handover_weight_kg'] = float(payload['handover_weight_kg'])
        if payload.get('distiller_partner_id'):
            values['handover_partner_id'] = int(payload['distiller_partner_id'])
        harvest.write(values)
        return 'syailendra.harvest', harvest.id
