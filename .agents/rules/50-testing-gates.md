---
trigger: model_decision
description: Test scope, gate commands, and reporting expectations before claiming completion.
---

# Testing and Gate Rules

- Define acceptance criteria before implementation and test them explicitly.
- Run the gates that exist in `package.json` (lint, type check, unit/integration tests,
  build). If a script does not exist, say so instead of reporting a pass.
- Test the negative paths: unauthorized company, duplicate submission, malformed Odoo
  response, QC rejection, missing translation key, stale session.
- Test translation symmetry between `src/messages/id/**` and `src/messages/en/**`.
- For Odoo concerns, validate against a non-production database or a controlled test
  addon path; never run write tests against production data without explicit approval.
- Report exactly which tests ran and their real result, plus what was skipped and why.
- A successful build proves compilation only; it does not prove security, correctness,
  or production readiness.
