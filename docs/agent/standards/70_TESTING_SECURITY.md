# Testing and Security Standards

## Tests

- Unit-test domain logic and validation boundaries.
- Integration-test JSON-RPC service mapping, error handling, company scoping, and
  server actions against a mocked or non-production backend.
- E2E-test critical user journeys: supplier approval, harvest capture, distillation,
  receipt quarantine, QC release, lot genealogy, and public trace minimization.
- Verify regression paths, not only happy paths: duplicate submission, stale session,
  unauthorized company, QC rejection, missing translations, and malformed Odoo data.
- State exact tests executed and outcomes; do not infer passing tests from a build.

## Security

- Treat every user, partner, imported file, and external API response as untrusted input.
- Enforce authentication and record-level authorization server-side.
- Keep `.env.local`, OAuth tokens, DB passwords, API keys, SSH materials, and runtime
  logs out of Git, docs, screenshots, prompts, and MCP config.
- Add safe `.env.example` entries with blank or obvious placeholder values only.
- Limit upload MIME types, extension, size, access scope, storage lifetime, and malware
  scanning policy; do not trust file extensions alone.
- Prevent IDOR by verifying record ownership/company for every read and mutation.
- Minimize public trace payload; use opaque, revocable tokens and rate limits where
  required.
- Review dependency origin, license, maintenance, and security advisories before
  adding packages or skills.
