# RULES.md — Operational & Development Guidelines

**Syailendra Group ERP Project Standards**

1. **Commit & Pull Discipline:**
   - Small, focused, reversible increments.
   - Verify build integrity with `npm run build` before pushing.
2. **Environment Variables:**
   - Never commit `.env.local` or raw Odoo admin passwords into Git.
   - All runtime secrets must be read from `process.env`.
3. **Double-Entry Consistency:**
   - Every stock move must pair a valid `location_id` and `location_dest_id`.
   - Never force-update `stock.quant` manually; always use `stock.move` or standard inventory adjustment wizards.
