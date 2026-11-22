# -*- coding: utf-8 -*-
"""Promotion of reviewed submissions (distiller side and partner onboarding).

Kontrak kode kesalahan (UI W5): setiap UserError di bawah ini dibawa prefix
stabil 'E_*: ...' yang cocok dengan yang didefinisikan di
syailendra_partner_submission.py. UI memotong alles sampai ': ' pertama dan
menampilkan sisa pesan (Bahasa Indonesia) kepada pengguna.
"""
from odoo import _, models
from odoo.exceptions import UserError

DISTILLATION_FIELDS = (
    'distillation_date', 'biomass_input_kg', 'crude_oil_output_kg', 'hydrosol_output_liter',
    'duration_hours', 'peak_temp_c', 'steam_pressure_bar', 'operator_name', 'notes',
    'sanitation_passed', 'prep_start_at', 'distillation_start_at', 'first_drop_at', 'end_at',
    'method', 'steam_water_temp_c', 'cycles_count', 'steam_source', 'biomass_condition',
    'oil_volume_liter', 'filtered_oil_kg', 'packed_oil_kg', 'production_notes',
)
SHIPMENT_FIELDS = (
    'po_reference', 'shipment_date', 'quantity_kg', 'quantity_liter', 'package_count',
    'package_code', 'package_type', 'vehicle', 'condition', 'received_at_sbi_date', 'notes',
)
DISTILLERY_FIELDS = (
    'name', 'business_name', 'boiler_capacity_kg', 'boiler_count', 'boiler_material',
    'distillation_method', 'fuel_type', 'latitude', 'longitude', 'facility_area_m2',
    'country_id', 'state_id', 'city_id', 'district_id', 'subdistrict_id', 'address_detail',
)
APPLICANT_PARTNER_FIELDS = (
    'name', 'nik', 'mobile', 'phone', 'email', 'street', 'address_detail',
    'country_id', 'state_id', 'city_id', 'district_id', 'subdistrict_id', 'zip',
    'land_area_m2', 'partner_latitude', 'partner_longitude',
)


class SyailendraPartnerSubmissionPromotionDistiller(models.Model):
    _inherit = 'syailendra.partner.submission'

    # ------------------------------------------------------------------
    # Distillation -> syailendra.distillation
    # ------------------------------------------------------------------
    def _resolve_distillery(self, record, payload, links):
        distillery_id = self._value(links, payload, 'distillery_id')
        Distillery = self.env['syailendra.distillery']
        if distillery_id:
            distillery = Distillery.browse(int(distillery_id)).exists()
            if not distillery or distillery.partner_id != record.partner_id:
                record._fail('E_DISTILLERY_FOREIGN', _('Fasilitas penyulingan bukan milik mitra ini.'))
            return distillery
        facility = payload.get('facility') or {}
        values = self._project(facility, DISTILLERY_FIELDS)
        if not values.get('name'):
            record._fail('E_DISTILLERY_INCOMPLETE', _('Data fasilitas belum lengkap. Lengkapi saat review sebelum menyetujui.'))
        values.update({'partner_id': record.partner_id.id, 'company_id': record.company_id.id})
        return Distillery.create(values)

    def _assert_same_region(self, lot_state, facility_state):
        """SOP-02: biomass from different regions must never be mixed.

        The lot's farm province and the distillery province must both be known
        and identical; unknown region data is refused rather than assumed.
        """
        if not lot_state or not facility_state:
            self._fail('E_REGION_UNKNOWN', _(
                'Provinsi asal lot dan provinsi fasilitas penyulingan wajib lengkap '
                'sebelum penyulingan disetujui.'
            ))
        if lot_state != facility_state:
            self._fail('E_REGION_MISMATCH', _(
                'Lot panen dan fasilitas penyulingan harus berada di provinsi yang sama. '
                'Panen beda wilayah tidak boleh digabung.'
            ))

    def _promote_distillation(self, record, links):
        payload = record.payload or {}
        harvest_id = self._require_value(links, payload, 'harvest_id', _('Lot panen input'))
        product_id = self._require_value(links, payload, 'product_id', _('Produk minyak'))
        harvest = self.env['syailendra.harvest'].browse(int(harvest_id)).exists()
        if not harvest:
            record._fail('E_DISTILLATION_HARVEST_NOT_FOUND', _('Lot panen input tidak ditemukan.'))
        if harvest.state != 'delivered':
            record._fail('E_DISTILLATION_HARVEST_STATE', _('Lot panen harus berstatus diserahkan sebelum disuling.'))
        distillery = self._resolve_distillery(record, payload, links)
        self._assert_same_region(harvest.farm_id.state_id, distillery.state_id)
        values = self._project(payload, DISTILLATION_FIELDS)
        for mandatory in ('distillation_date', 'biomass_input_kg'):
            if not values.get(mandatory):
                record._fail('E_DISTILLATION_INCOMPLETE', _('Data penyulingan wajib (%s) belum lengkap.') % mandatory)
        if float(values['biomass_input_kg']) <= 0:
            record._fail('E_DISTILLATION_BIOMASS_INVALID', _('Biomassa masuk harus lebih besar dari nol.'))
        values.update({
            'distillery_id': distillery.id,
            'harvest_id': harvest.id,
            'product_id': int(product_id),
            'company_id': record.company_id.id,
        })
        distillation = self.env['syailendra.distillation'].create(values)
        return 'syailendra.distillation', distillation.id

    # ------------------------------------------------------------------
    # Shipment -> syailendra.distiller.shipment
    # ------------------------------------------------------------------
    def _promote_shipment(self, record, links):
        payload = record.payload or {}
        distillation_id = self._require_value(links, payload, 'distillation_id', _('Batch penyulingan'))
        distillation = self.env['syailendra.distillation'].browse(int(distillation_id)).exists()
        if not distillation or distillation.partner_id != record.partner_id:
            record._fail('E_SHIPMENT_FOREIGN', _('Batch penyulingan bukan milik mitra ini.'))
        values = self._project(payload, SHIPMENT_FIELDS)
        if not values.get('shipment_date'):
            record._fail('E_SHIPMENT_DATE_REQUIRED', _('Tanggal pengiriman wajib diisi.'))
        values.update({
            'partner_id': record.partner_id.id,
            'distillation_id': distillation.id,
            'submission_id': record.id,
            'product_id': distillation.product_id.id,
            'company_id': record.company_id.id,
        })
        shipment = self.env['syailendra.distiller.shipment'].create(values)
        return 'syailendra.distiller.shipment', shipment.id

    # ------------------------------------------------------------------
    # Partnership request -> res.partner + portal access (no PIN issued here)
    # ------------------------------------------------------------------
    def _promote_partnership_request(self, record, links):
        payload = record.payload or {}
        if record.partner_id:
            partner = record.partner_id
        else:
            ref = self._require_value(links, payload, 'ref', _('Kode mitra'))
            supplier_type_id = self._require_value(links, payload, 'supplier_type_id', _('Jenis supplier'))
            values = self._project(payload, APPLICANT_PARTNER_FIELDS)
            if not values.get('name'):
                values['name'] = record.applicant_name
            if not values.get('name'):
                record._fail('E_PARTNERSHIP_NAME_MISSING', _('Nama pemohon belum tersedia.'))
            if record.applicant_phone and not values.get('mobile'):
                values['mobile'] = record.applicant_phone
            values.update({
                'ref': ref,
                'supplier_rank': 1,
                'supplier_type_id': int(supplier_type_id),
                'company_id': record.company_id.id,
            })
            partner = self.env['res.partner'].create(values)

        role = self._value(links, payload, 'role', 'farmer')
        Access = self.env['syailendra.partner.access']
        access = Access.search([('partner_id', '=', partner.id)], limit=1)
        if not access:
            # A partner name contains spaces and would violate the access_code
            # constraint. Require an explicit code instead of inventing one.
            code = (partner.ref or self._value(links, payload, 'access_code') or '').strip().upper()
            if not code or ' ' in code:
                record._fail('E_PARTNERSHIP_ACCESS_CODE_MISSING', _(
                    'Kode mitra belum tersedia. Isi Kode Mitra (ref) pada mitra ini '
                    'sebelum menyetujui pengajuan kemitraan.'
                ))
            access = Access.create({
                'partner_id': partner.id,
                'access_code': code,
                'role': role,
            })
        record.partner_id = partner.id
        # The PIN is issued separately by a manager so it never lands in chatter.
        return 'res.partner', partner.id
