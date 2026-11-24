# AI — AI Assistant (Nona Atsirich)

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SAMMEND (commercial)

## 1. Purpose

Provide an in-app assistant that helps users query operational data and complete routine tasks under strict authorization limits.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(dashboard)/ai` | |

## 3. Current state

Landing route `/ai` only; `src/features/ai/` exists. No assistant backend was verified in this pass.

## 4. Planned scope (to be validated)

- Read-only data assistants scoped to the requesting user's permissions.
- Guided task completion (form pre-fill, checklist).
- Documentation and policy Q&A grounded in this repository's docs.
- Explicit refusal behaviour for unauthorized or destructive requests.

## 5. Dependencies

- Authorization model that mirrors dashboard permissions exactly.
- Provider selection, cost control, and prompt/data-handling policy.
- Audit logging of assistant queries and outputs.

## 6. Open questions

- Which data may be sent to an external model provider, and under which agreement?
- Must the assistant be strictly read-only in phase one?
- How are costs budgeted and capped?
