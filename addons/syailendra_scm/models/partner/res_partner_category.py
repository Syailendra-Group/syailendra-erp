# -*- coding: utf-8 -*-
"""Two-level guard for the supplier category tree on ``res.partner.category``.

The SCM supplier directory groups suppliers in a root -> sub-category tree of at
most two levels: a root groups, a sub-category tags suppliers. The rule lives on
the shared ``res.partner.category`` model because that is the model the SCM
frontend reads and writes, and it is symmetric, so a violation is rejected from
either direction:

* a category cannot be created or moved under a category that already has a
  parent (this would build a third level),
* a category that already owns sub-categories cannot be moved under another
  category (a grouping level must not become a tag).

Recursive parent chains are already rejected by the core
``res.partner.category`` recursion check; this constraint adds the depth and
grouping rules on top of it.
"""

from odoo import _, api, models
from odoo.exceptions import ValidationError


class ResPartnerCategory(models.Model):
    """Extend the shared partner category with the SCM two-level invariant."""

    _inherit = 'res.partner.category'

    @api.constrains('parent_id')
    def _check_supplier_category_two_levels(self):
        for category in self.with_context(active_test=False):
            parent = category.parent_id
            if not parent:
                continue

            if parent.parent_id:
                raise ValidationError(
                    _(
                        'Kategori pemasok hanya boleh dua tingkat. "%(name)s" tidak dapat '
                        'ditempatkan di bawah "%(parent)s" karena kategori induk tersebut '
                        'sudah memiliki kategori induknya sendiri.',
                        name=category.display_name,
                        parent=parent.display_name,
                    )
                )

            if category.child_ids:
                raise ValidationError(
                    _(
                        'Kategori "%(name)s" sudah menjadi induk dari %(count)s sub-kategori, '
                        'sehingga tidak dapat dipindahkan ke bawah kategori lain.',
                        name=category.display_name,
                        count=len(category.child_ids),
                    )
                )
