# RULES.md — Engineering & Operational Guidelines

> **Project:** ERP Syailendra Group  
> **Source Standard:** AI Point Of Sale System Blueprint Standards  
> **Last Updated:** 2026-10-27

---

## 1. Core Engineering Principles

1. **Clean Code & DRY (Don't Repeat Yourself):**
   - Extract logic to reusable utility functions in `src/lib/` or `src/utils/` if referenced more than once.
   - Keep components focused on a single responsibility.
2. **Strict Language Rule:**
   - All code logic, variable names, functions, comments, commits, and technical documentation must be written in professional **English**.
3. **Double-Entry Stock Invariant:**
   - Every inventory movement must originate from a valid source location and land in a valid destination location.
   - Never update stock quantities directly outside Odoo's validated transfer engine.

---

## 2. Environment & Secret Governance

1. **Zero Secret Exposure:**
   - Never commit `.env` or `.env.local` to Git.
   - Odoo connection credentials must remain isolated on the VPS server with restricted permissions (`chmod 600`).
2. **Public QR Route Data Hygiene:**
   - The route `/trace/[lot_code]` is public for consumers. Under no circumstance may internal cost prices (`standard_price`), purchase order contracts, or company profit margins be leaked in this response.

---

## 3. Pre-Commit Verification Protocol

Every task is deemed incomplete until all three verification gates pass with zero errors:

```bash
# 1. Format code with Prettier and Tailwind plugin
npm run format

# 2. Strict TypeScript typecheck (Zero error policy)
npm run typecheck

# 3. Production compilation with Turbopack
npm run build
```
