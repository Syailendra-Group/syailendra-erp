# -*- coding: utf-8 -*-
"""Hierarchy guard tests for the SCM two-level supplier category rule.

The rule is enforced on the shared ``res.partner.category`` model, so these
tests exercise the model directly rather than the storefront service layer.
"""

from odoo.exceptions import ValidationError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestSupplierCategoryHierarchy(TransactionCase):
    """Depth and grouping rules for the supplier category tree."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Category = cls.env['res.partner.category']
        cls.root = cls.Category.create({'name': 'ZZ Hierarchy Root'})
        cls.sub = cls.Category.create({'name': 'ZZ Hierarchy Sub', 'parent_id': cls.root.id})
        cls.other_root = cls.Category.create({'name': 'ZZ Hierarchy Other Root'})

    def test_00_guard_is_installed_on_the_shared_model(self):
        """Loading the wrong addons tree must fail loudly, not silently pass."""
        self.assertTrue(
            hasattr(self.Category, '_check_supplier_category_two_levels'),
            'SCM supplier category guard is not loaded on res.partner.category',
        )

    def test_01_root_has_no_parent(self):
        """A top-level category stays a root."""
        self.assertFalse(self.root.parent_id)

    def test_02_sub_category_under_root_is_allowed(self):
        """Level two is the deepest allowed level."""
        self.assertEqual(self.sub.parent_id, self.root)

    def test_03_third_level_creation_is_rejected(self):
        """A category cannot be created under a sub-category."""
        with self.assertRaises(ValidationError):
            self.Category.create({'name': 'ZZ Hierarchy Level 3', 'parent_id': self.sub.id})

    def test_04_third_level_move_is_rejected(self):
        """A standalone category cannot be moved under a sub-category."""
        lone = self.Category.create({'name': 'ZZ Hierarchy Lone'})
        with self.assertRaises(ValidationError):
            lone.parent_id = self.sub.id

    def test_05_grouping_category_cannot_gain_a_parent(self):
        """A category that owns sub-categories must stay at the top level."""
        with self.assertRaises(ValidationError):
            self.root.parent_id = self.other_root.id

    def test_06_leaf_that_became_a_tag_cannot_gain_children(self):
        """A category already placed under a parent cannot become a grouping level."""
        leaf = self.Category.create({'name': 'ZZ Hierarchy Leaf'})
        leaf.parent_id = self.root.id
        with self.assertRaises(ValidationError):
            self.Category.create({'name': 'ZZ Hierarchy Leaf Child', 'parent_id': leaf.id})

    def test_07_grouping_category_can_be_demoted_once_children_are_detached(self):
        """Detaching every sub-category releases the grouping lock."""
        grouping = self.Category.create({'name': 'ZZ Hierarchy Grouping'})
        child = self.Category.create({'name': 'ZZ Hierarchy Grouping Child', 'parent_id': grouping.id})
        with self.assertRaises(ValidationError):
            grouping.parent_id = self.other_root.id
        child.parent_id = self.root.id
        grouping.parent_id = self.other_root.id
        self.assertEqual(grouping.parent_id, self.other_root)

    def test_08_supplier_tagging_still_works(self):
        """Tagging a partner with a root and a sub-category stays allowed."""
        partner = self.env['res.partner'].create({'name': 'ZZ Hierarchy Partner'})
        partner.category_id = [(6, 0, [self.root.id, self.sub.id])]
        self.assertEqual(len(partner.category_id), 2)

    def test_09_archived_child_still_locks_parent_category(self):
        """Archiving every child must not allow a third hierarchy level."""
        grouping = self.Category.create({'name': 'ZZ Hierarchy Archived Group'})
        child = self.Category.create({
            'name': 'ZZ Hierarchy Archived Child',
            'parent_id': grouping.id,
            'active': False,
        })
        self.assertEqual(child.parent_id, grouping)
        with self.assertRaises(ValidationError), self.cr.savepoint():
            grouping.write({'parent_id': self.other_root.id})

