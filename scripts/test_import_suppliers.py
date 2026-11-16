#!/usr/bin/env python3
"""Offline checks for scripts/import_suppliers.py (no network, no Odoo)."""

import unittest

import import_suppliers as imp


class FakeOdoo:
    """In-memory stand-in for the JSON-RPC client."""

    def __init__(self):
        self.partners = {}
        self.categories = {}
        self._cat_seq = 100
        self.calls = []

    def kw(self, model, method, args, kwargs=None):
        self.calls.append((model, method))
        if model == "res.partner.category":
            if method == "search":
                name, parent = args[0][0][2], args[0][1][2]
                for cid, cat in self.categories.items():
                    if cat["name"] == name and cat["parent_id"] == parent:
                        return [cid]
                return []
            if method == "create":
                self._cat_seq += 1
                values = dict(args[0])
                values.setdefault("parent_id", False)
                self.categories[self._cat_seq] = values
                return self._cat_seq
        if model == "res.partner":
            if method == "search":
                ref = args[0][0][2]
                return [pid for pid, p in self.partners.items() if p.get("ref") == ref]
            if method == "read":
                ids, fields = args
                pid = ids[0]
                return [{**{f: self.partners[pid].get(f) for f in fields},
                         "id": pid,
                         "category_id": self.partners[pid].get("category_id", [])}]
            if method == "create":
                pid = len(self.partners) + 1
                values = dict(args[0])
                if "category_id" in values:
                    values["category_id"] = list(values["category_id"][0][2])
                self.partners[pid] = values
                return pid
            if method == "write":
                ids, values = args
                pid = ids[0]
                for key, value in values.items():
                    if key == "category_id":
                        self.partners[pid].setdefault("category_id", []).append(value[0][1])
                    else:
                        self.partners[pid][key] = value
                return True
        raise AssertionError(f"unexpected call {model}.{method}")


def record(name="SUPPLIER A", cat="1.2 Perorangan Penyuling", ref="FMR-AAA-001"):
    return {
        "name": name,
        "legacy_code": ref,
        "planned_category": cat,
        "payload": {"name": name, "ref": ref, "supplier_rank": 1, "is_company": False,
                    "phone": "+62811000000", "email": None, "street": None,
                    "comment": "Accurate ID: AAA-001"},
    }


class ImportTests(unittest.TestCase):
    def test_excluded_rows_are_skipped(self):
        client = FakeOdoo()
        stats = imp.apply_plan(client, [record(name="PAJAK"), record(name="ppn")], 1, apply=False)
        self.assertEqual(stats["excluded"], 2)
        self.assertEqual(stats["created"], 0)

    def test_dry_run_writes_nothing(self):
        client = FakeOdoo()
        stats = imp.apply_plan(client, [record()], 1, apply=False)
        self.assertEqual(stats["created"], 1)
        self.assertFalse(client.partners)
        self.assertFalse(client.categories)

    def test_apply_is_idempotent(self):
        client = FakeOdoo()
        first = imp.apply_plan(client, [record()], 1, apply=True)
        second = imp.apply_plan(client, [record()], 1, apply=True)
        self.assertEqual(first["created"], 1)
        self.assertEqual(first["categories_created"], 2)  # root + child
        self.assertEqual(second["created"], 0)
        self.assertEqual(second["categories_created"], 0)
        self.assertEqual(second["unchanged"], 1)
        self.assertEqual(len(client.partners), 1)

    def test_human_edits_survive_rerun(self):
        client = FakeOdoo()
        imp.apply_plan(client, [record()], 1, apply=True)
        client.partners[1]["phone"] = "+628999999999"
        imp.apply_plan(client, [record()], 1, apply=True)
        self.assertEqual(client.partners[1]["phone"], "+628999999999")

    def test_every_plan_category_has_root(self):
        for cat in ["1.1 Perorangan Petani", "1.2 Perorangan Penyuling", "03. X",
                    "04. X", "05. X", "06. X", "07. X", "2.2 Perusahaan Eksportir"]:
            self.assertTrue(imp.root_for(cat))

    def test_ref_collision_with_internal_record_is_skipped(self):
        client = FakeOdoo()
        client.partners[1] = {"ref": "FMR-AAA-001", "name": "SYAILENDRA SERVER",
                              "supplier_rank": 0, "category_id": []}
        stats = imp.apply_plan(client, [record(ref="FMR-AAA-001")], 1, apply=True)
        self.assertEqual(stats["conflicts"], 1)
        self.assertEqual(stats["updated"], 0)
        self.assertEqual(stats["created"], 0)
        self.assertEqual(client.partners[1]["name"], "SYAILENDRA SERVER")

    def test_missing_company_is_backfilled_on_update(self):
        client = FakeOdoo()
        client.partners[1] = {"ref": "FMR-AAA-001", "name": "SUPPLIER A",
                              "supplier_rank": 1, "category_id": []}
        stats = imp.apply_plan(client, [record(ref="FMR-AAA-001")], 1, apply=True)
        self.assertEqual(stats["updated"], 1)
        self.assertEqual(client.partners[1]["company_id"], 1)


if __name__ == "__main__":
    unittest.main()
