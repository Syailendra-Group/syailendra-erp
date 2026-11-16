# -*- coding: utf-8 -*-
from odoo import api, models
from odoo.exceptions import ValidationError


class StockMoveLine(models.Model):
    """Gerbang mutu: lot atsiri tidak boleh keluar perusahaan sebelum dirilis QC."""

    _inherit = 'stock.move.line'

    @api.constrains('lot_id', 'location_dest_id', 'quantity')
    def _check_quarantine_release(self):
        for line in self:
            lot = line.lot_id
            if not lot or line.quantity <= 0:
                continue
            if line.location_dest_id.usage != 'customer':
                continue
            if lot.quarantine_state == 'approved':
                continue
            gated = (
                lot.product_id.requires_qc_release
                or lot.harvest_id
                or lot.distillation_id
            )
            if not gated:
                continue
            states = dict(lot._fields['quarantine_state'].selection)
            raise ValidationError(
                'Lot %(lot)s berstatus "%(state)s" dan belum dirilis QC. '
                'Rilis melalui uji QC (action_approve) sebelum pengiriman.'
                % {'lot': lot.name, 'state': states.get(lot.quarantine_state, lot.quarantine_state)}
            )
