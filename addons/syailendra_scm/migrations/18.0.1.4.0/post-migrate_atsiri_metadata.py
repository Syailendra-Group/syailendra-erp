# -*- coding: utf-8 -*-
"""Lift legacy product metadata from `description` into `atsiri_metadata`.

Before 18.0.1.4.0 the frontend stored the atsiri specification blob as JSON inside
`product.template.description` (a translated JSONB field), wrapped in a `<p>` tag by
the Odoo editor. The real schema now owns `atsiri_metadata` and `atsiri_category`, so
this migration unwraps every parseable payload once and leaves prose descriptions
untouched.
"""
import html
import json
import logging
import re

_logger = logging.getLogger(__name__)

PREFIX_CATEGORY = {
    'EO': 'essential_oils',
    'FG': 'essential_oils',
    'RAW': 'raw_biomass',
    'PKG': 'packaging',
}

TAG_RE = re.compile(r'<[^>]+>')


def _extract_text(description):
    if isinstance(description, dict):
        return description.get('en_US') or next(iter(description.values()), None)
    if isinstance(description, str):
        return description
    return None


def _clean_payload(text):
    """Strip editor markup and decode entities before JSON parsing."""
    stripped = TAG_RE.sub('', text)
    return html.unescape(stripped).strip()


def migrate(cr, version):
    if not version:
        return

    cr.execute(
        """
        SELECT id, default_code, atsiri_category, description
        FROM product_template
        WHERE description IS NOT NULL
        """
    )
    rows = cr.fetchall()

    metadata_count = 0
    category_count = 0

    for product_id, default_code, category, description in rows:
        text = _extract_text(description)
        if not text:
            continue

        try:
            parsed = json.loads(_clean_payload(text))
        except (TypeError, ValueError):
            continue

        if not isinstance(parsed, dict) or not parsed:
            continue

        cr.execute(
            "UPDATE product_template SET atsiri_metadata = %s::jsonb WHERE id = %s",
            (json.dumps(parsed), product_id),
        )
        metadata_count += 1

        if not category and default_code:
            prefix = default_code.split('-')[0].upper()
            mapped = PREFIX_CATEGORY.get(prefix)
            if mapped:
                cr.execute(
                    "UPDATE product_template SET atsiri_category = %s WHERE id = %s",
                    (mapped, product_id),
                )
                category_count += 1

    _logger.info(
        'syailendra_scm 18.0.1.4.0: migrated %s atsiri_metadata rows, %s categories',
        metadata_count,
        category_count,
    )