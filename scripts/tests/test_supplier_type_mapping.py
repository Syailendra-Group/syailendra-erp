"""Offline tests for the supplier-type classification policy (no Odoo needed).

Category names below are copied verbatim from the production database so the
fixtures represent data that actually exists (fix S4).
"""

import importlib.util
import unittest
from pathlib import Path

_SPEC = importlib.util.spec_from_file_location(
    "migrate_supplier_types",
    Path(__file__).resolve().parent.parent / "migrate_supplier_types.py",
)
migrate = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(migrate)


class TestClassification(unittest.TestCase):
    def test_upstream_actors_are_directly_classified(self):
        cases = [
            ("1.1 Perorangan Petani", "Petani", False),
            ("1.2 Perorangan Penyuling", "Penyuling", False),
            ("1.3 Kelompok Petani/Penyuling", "Kelompok Tani", False),
            ("1.4 Koperasi Tani", "Koperasi", False),
            ("1.6 Perusahaan Bahan Baku", "Perusahaan", False),
            ("2.2 Perusahaan Eksportir", "Perusahaan", False),
        ]
        for name, expected_type, expected_review in cases:
            with self.subTest(category=name):
                result = migrate.resolve_classification([name])
                self.assertEqual(result["type_name"], expected_type)
                self.assertFalse(result["needs_review"])

    def test_procurement_groups_are_flagged_for_review(self):
        for name in [
            "03. Pemasok Sample R&D",
            "04. Pemasok Sticker & Label",
            "05. Pemasok Botol & Tutup",
            "06. Pemasok Perlengkapan Lainnya",
            "07. Pemasok Bahan Kimia QC",
        ]:
            with self.subTest(category=name):
                result = migrate.resolve_classification([name])
                self.assertIn(result["type_name"], ("UMKM", "Perusahaan"))
                self.assertTrue(result["needs_review"])

    def test_unmapped_categories_stay_empty_and_flagged(self):
        for name in ["1.5 BUMN / BUMD / BUMDes", "2.1 Perorangan Eksportir"]:
            with self.subTest(category=name):
                result = migrate.resolve_classification([name])
                self.assertIsNone(result["type_name"])
                self.assertTrue(result["needs_review"])

    def test_no_category_is_unclassified_and_flagged(self):
        result = migrate.resolve_classification([])
        self.assertIsNone(result["type_name"])
        self.assertTrue(result["needs_review"])
        self.assertIsNone(result["matched_prefix"])

    def test_specific_prefix_beats_generic_and_survives_slash_names(self):
        result = migrate.resolve_classification(["1.3 Kelompok Petani/Penyuling"])
        self.assertEqual(result["type_name"], "Kelompok Tani")
        self.assertEqual(result["matched_prefix"], "1.3")

    def test_longest_prefix_wins_when_rules_overlap(self):
        ordered = sorted(migrate.CLASSIFICATION_RULES, key=lambda rule: len(rule[0]), reverse=True)
        self.assertEqual(ordered[0][0], "1.1")

    def test_multi_category_prefers_first_ordered_match(self):
        result = migrate.resolve_classification(["05. Pemasok Botol & Tutup", "1.2 Perorangan Penyuling"])
        self.assertEqual(result["type_name"], "Penyuling")

    def test_every_production_category_name_is_covered(self):
        """The 13 live category labels, verbatim, must all resolve."""
        live_names = [
            "03. Pemasok Sample R&D",
            "04. Pemasok Sticker & Label",
            "05. Pemasok Botol & Tutup",
            "06. Pemasok Perlengkapan Lainnya",
            "07. Pemasok Bahan Kimia QC",
            "1.1 Perorangan Petani",
            "1.2 Perorangan Penyuling",
            "1.3 Kelompok Petani/Penyuling",
            "1.4 Koperasi Tani",
            "1.5 BUMN / BUMD / BUMDes",
            "1.6 Perusahaan Bahan Baku",
            "2.1 Perorangan Eksportir",
            "2.2 Perusahaan Eksportir",
        ]
        for name in live_names:
            with self.subTest(category=name):
                self.assertIsNotNone(migrate.resolve_classification([name])["matched_prefix"])


class TestPlanAction(unittest.TestCase):
    """The guard that keeps human-verified rows untouched on later runs."""

    def test_unclassified_row_is_updated(self):
        action, reason = migrate.plan_action(False, False, 7, True)
        self.assertEqual((action, reason), ("update", None))

    def test_already_current_row_is_skipped(self):
        action, reason = migrate.plan_action(7, True, 7, True)
        self.assertEqual((action, reason), ("skip", "already_current"))

    def test_human_verified_row_is_never_rewritten(self):
        # Verified row whose type no longer matches the policy: still skipped.
        action, reason = migrate.plan_action(3, False, 7, True)
        self.assertEqual((action, reason), ("skip", "human_verified"))

    def test_verified_row_with_matching_type_is_skipped(self):
        action, reason = migrate.plan_action(7, False, 7, False)
        self.assertEqual((action, reason), ("skip", "human_verified"))

    def test_flagged_row_can_be_reclassified(self):
        action, reason = migrate.plan_action(7, True, 3, False)
        self.assertEqual((action, reason), ("update", None))

    def test_empty_target_with_no_previous_value_is_skipped(self):
        action, reason = migrate.plan_action(False, True, False, True)
        self.assertEqual((action, reason), ("skip", "already_current"))


if __name__ == "__main__":
    unittest.main()
