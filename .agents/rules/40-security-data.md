---
trigger: model_decision
description: Authorization, data protection, upload, storage, and audit rules for ERP features.
---

# Security and Data Rules

- Enforce authorization server-side per record and per company for every read and
  mutation; prevent IDOR by verifying ownership, not by trusting submitted IDs.
- Multi-company calls must declare allowed companies explicitly; validate that the
  requested company is within the user's permitted set.
- Treat uploads as hostile: restrict MIME type and extension, cap size, scan or validate
  content, store outside the web root (object storage), and authorize every download.
- Media rows store metadata, object key, checksum, content type, size, and access
  policy — never inline binary in the database or in the repository.
- Personal, financial, and commercial data is minimized in logs; log correlation IDs and
  operational context instead of payload bodies.
- Data retention and deletion follow the owner's policy; deletions are soft/archived
  unless an approved erasure process applies.
- Dependencies, skills, and MCP servers are third-party code: verify origin, license,
  maintenance status, and advisories before adding them.
