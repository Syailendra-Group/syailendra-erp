---
trigger: glob
globs: "**/*.ts, **/*.tsx"
description: TypeScript strictness, typing, and error-handling rules.
---

# TypeScript Rules

- Keep `strict` on; do not weaken compiler or lint settings to make a change pass.
- No `any`. Use `unknown` plus narrowing, or a real domain type. Types that cross
  layers belong in `src/types/`.
- Validate external payloads (Odoo JSON-RPC, Accurate, storage) at runtime before use;
  TypeScript types never validate JSON.
- Prefer discriminated unions and exhaustive handling for state and result types.
- Keep public function return types explicit; use `import type` for type-only imports.
- Handle errors: never swallow them, never return `undefined` for an unexpected
  failure, and never surface raw server traces to the browser.
- Represent money, mass, and volume with explicit units; never mix currencies or units
  silently.
