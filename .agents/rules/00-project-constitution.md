---
trigger: always_on
description: Non-negotiable Syailendra ERP rules: English, no secrets, no hardcoded UI text, evidence discipline, approval gates.
---

# Project Constitution

1. Write code, comments, commit messages, and technical documentation in English.
2. Never read or expose `.env.local`; never place secret values in code, docs, logs,
   tests, screenshots, prompts, or MCP configuration. `.env.example` carries names only.
3. No hardcoded user-facing text: use `next-intl` keys with symmetric `id`/`en` files.
4. No hardcoded credentials, hostnames, ports, or API keys inside components/services;
   read them from environment configuration.
5. Verify before claiming: state the exact command or check performed and its real
   result. Distinguish verified facts, assumptions, and open questions.
6. Ask for explicit approval before commit, push, deploy, migration, production data
   change, or infrastructure change.
7. Prefer focused, reversible changes; inspect existing conventions before editing and
   never overwrite unrelated uncommitted work in this shared repository.
8. Requirements come from `docs/agent/`; unconfirmed items remain open questions.
