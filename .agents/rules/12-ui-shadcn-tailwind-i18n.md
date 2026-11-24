---
trigger: glob
globs: "src/components/**, src/features/**, src/messages/**, src/app/**"
description: UI, design-token, form, dialog, and translation conventions.
---

# UI, Design Token, and Translation Rules

- Use the project shadcn/ui primitives and Tailwind semantic design tokens; no literal
  colors, no forked primitives without a reusable need.
- Forms: shadcn-admin action-dialog pattern (6-column grid) inside a modal; a dedicated
  page for large multi-section forms. Reusable inputs live in `src/components/form/`.
- Dialog footers keep clear spacing (`mt-4 pt-3 border-t gap-2`). Descriptions and
  addresses use `Textarea`.
- Zod messages resolve through the centralized i18n message resolver
  (`createSchemaMessageResolver(t)` from `@/utils/schema-helper`); do not inline messages.
- Every string is a translation key present in both `src/messages/id/**` and
  `src/messages/en/**` — equal key paths, correct wording for each language.
- Accessibility: semantic elements, associated labels, keyboard operability, visible
  focus, and status conveyed by more than color alone.
- Every page provides a reusable breadcrumb and a truthful loading state that mirrors
  the real content structure.
