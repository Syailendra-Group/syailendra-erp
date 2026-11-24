"""Odoo 18 ORM smoke-test harness for a custom addon (clone DB only).

Run:
    docker cp smoke.py odoo:/tmp/smoke.py
    docker exec -i odoo odoo shell -c /etc/odoo/odoo.conf -d <db>_test --no-http < /tmp/smoke.py

Then assert with a grep, not by reading logs:
    ... | grep -E 'RESULT_|Traceback'

Contract:
  * Every assertion prints one `RESULT_<LABEL>=<value>` line.
  * The transaction is ALWAYS rolled back, so the clone DB is left untouched and
    the script is safe to re-run; only ir.sequence counters advance (nextval is
    non-transactional), which is harmless on a throwaway database.
  * Fill the `# --- ARRANGE` block with real records for the addon under test.
"""
from odoo.exceptions import AccessError  # noqa: F401  (used by ACL probes)

results = []


def check(label, value):
    """Queue a printable assertion result."""
    results.append((label, value))


try:
    company = env.company

    # --- ARRANGE: minimal records, no business volume needed -------------
    partner = env['res.partner'].create({
        'name': 'SMOKE TEST PARTNER',
        'supplier_rank': 1,
        'company_id': company.id,
    })
    product = env['product.product'].search([('type', '!=', 'service')], limit=1)

    # --- ACT: exercise the addon's models, computes and workflow methods --
    check('PARTNER_ID', partner.id)
    check('PRODUCT_ID', product.id or 'NONE')
    # record = env['my.model'].create({...})
    # record.action_something()
    # check('MY_COMPUTED_FIELD', record.computed_field)

    # --- ACL PROBE: a user with only the base module group ---------------
    # user = env['res.users'].create({
    #     'name': 'SMOKE TEST USER',
    #     'login': 'smoke.test@example.invalid',
    #     'company_id': company.id,
    #     'company_ids': [(6, 0, [company.id])],
    #     'groups_id': [(6, 0, [env.ref('<module>.group_<x>_user').id])],
    # })
    # try:
    #     record.with_user(user).write({'name': 'forbidden'})
    #     check('ACL_WRITE', 'NOT_ENFORCED')
    # except AccessError:
    #     check('ACL_WRITE', 'DENIED_OK')

finally:
    env.cr.rollback()
    for label, value in results:
        print('RESULT_%s=%s' % (label, value))
    print('RESULT_ROLLBACK=OK')
