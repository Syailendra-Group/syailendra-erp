# -*- coding: utf-8 -*-
"""Fill structured essential-oil metadata for syailendra_scm 18.0.1.3.0.

Derive `atsiri_category` from the `default_code` prefix (EO/FG/RAW/PKG) for every product,
and carry over any legacy structured metadata stored in the translated `description` JSONB
column. Pure data backfill -- the new columns are created by the ORM field definitions.
"""

import json
import logging

_logger = logging.getLogger(__name__)

CATEGORY_BY_PREFIX = {
    "EO": "essential_oils",
    "FG": "essential_oils",
    "RAW": "raw_biomass",
    "PKG": "packaging",
}


def migrate(cr, version):
    if version is None:
        return

    import odoo  # noqa: PLC0415 -- migration-time import
    from odoo import api  # noqa: PLC0415

    env = api.Environment(cr, odoo.SUPERUSER_ID, {})
    products = env["product.template"].with_context(active_test=False).search([])

    updated = 0
    for product in products:
        code = product.default_code or ""
        prefix = code.split("-")[0].upper() if code else ""
        category = CATEGORY_BY_PREFIX.get(prefix)

        metadata = None
        raw_description = product.description
        if isinstance(raw_description, (str, bytes)):
            try:
                parsed = json.loads(raw_description if isinstance(raw_description, str) else raw_description.decode())
                if isinstance(parsed, dict) and parsed:
                    metadata = parsed
            except (ValueError, TypeError):
                metadata = None

        values = {}
        if category and product.atsiri_category != category:
            values["atsiri_category"] = category
        if metadata and product.atsiri_metadata != metadata:
            values["atsiri_metadata"] = metadata

        if values:
            product.write(values)
            updated += 1

    _logger.info("syailendra_scm 18.0.1.3.0: backfilled atsiri metadata on %d products", updated)
