# MITRA — Partner Portal (Farmer & Distiller)

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SBI (upstream)

## 1. Purpose

External portal where partner farmers and distillers register their plots, harvests, distillations, and shipments, feeding the traceability chain.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(mitra)/mitra` | |
| `(mitra)/mitra/login` | |
| `(mitra)/mitra/ganti-pin` | |
| `(mitra)/mitra/kebun` | |
| `(mitra)/mitra/kebun/baru` | |
| `(mitra)/mitra/kebun/[id]` | |
| `(mitra)/mitra/panen` | |
| `(mitra)/mitra/panen/baru` | |
| `(mitra)/mitra/panen/[id]` | |
| `(mitra)/mitra/distilasi` | |
| `(mitra)/mitra/distilasi/baru` | |
| `(mitra)/mitra/distilasi/[id]` | |
| `(mitra)/mitra/kirim` | |
| `(mitra)/mitra/kirim/baru` | |
| `(mitra)/mitra/kirim/[id]` | |
| `(mitra)/mitra/serah-terima/baru` | |
| `(mitra)/mitra/submissions/new` | |
| `(mitra)/offline` | |

## 3. Current state

This is the most developed non-SCM surface: 18 routes in a separate `(mitra)` route group with its own login and PIN change, an offline route, and Indonesian-language route names. Backing addon models exist (`syailendra.partner.access`, `syailendra.partner.submission`, `syailendra.distiller.shipment`, `syailendra.portal.access.log`). Live snapshot showed 0 access records, 0 submissions, 0 media rows — the portal is built but not in operational use.

## 4. Planned scope (to be validated)

- Partner onboarding and credential/PIN lifecycle.
- Plot (kebun), harvest (panen), distillation (distilasi), and shipment (kirim) submission.
- Offline-tolerant capture for field conditions.
- Review/approval workflow converting submissions into SCM records.
- Access logging and abuse protection.

## 5. Dependencies

- Dedicated partner session secret (`PARTNER_SESSION_SECRET`) and rate limiting.
- Review workflow with SCM operators.
- Media upload constraints and object storage.
- Decision on offline strategy and device support.

## 6. Open questions

- Q-10: portal file retention, consent, and deletion policy.
- Is PIN sufficient for partner authentication, or is device binding/OTP required?
- Who reviews submissions, and what is the service-level expectation?
- Does the portal's Indonesian-only route naming remain, or become locale-prefixed?
