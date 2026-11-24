# AUTH — Authentication and Session Security

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** Cross-entity (platform)

## 1. Purpose

Authenticate dashboard users, partners, and public visitors with clear separation of trust levels.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `login` | |
| `(mitra)/mitra/login` | |

## 3. Current state

Two login surfaces exist (dashboard `/[locale]/login` and partner `/mitra/login`) with separate session secrets; `src/features/auth/` exists; Cloudflare Turnstile keys are configured in `.env.example`; Supabase platform auth is configured for the self-hosted platform.

## 4. Planned scope (to be validated)

- Dashboard session issuance, expiry, revocation, and audit.
- Partner authentication (PIN plus any second factor) isolated from staff sessions.
- Role-based access control mapped to Odoo groups.
- Turnstile/anti-abuse enforcement and lockout policy.
- Credential rotation and session invalidation procedure.

## 5. Dependencies

- Owner decision on identity source (Odoo users vs Supabase vs both).
- Rate limiting and lockout configuration.
- Secret management practice for `SESSION_SECRET` and `PARTNER_SESSION_SECRET`.

## 6. Open questions

- Which store is authoritative for staff identities, and how are passwords handled?
- What lockout/throttling policy is acceptable for partners, who may mistype on mobile?
- Who approves access grants for new staff and partners?
