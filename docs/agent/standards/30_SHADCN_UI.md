# shadcn/ui Standards

- Use the installed shadcn/ui component set and project conventions. Components are
  copied into the codebase; review generated code rather than treating it as a black box.
- Prefer composition and accessible Radix primitives over custom interaction code.
- Forms use shared reusable controls in `src/components/form/` and central Zod
  message resolver `createSchemaMessageResolver(t)` from `@/utils/schema-helper`.
- For action dialogs, use the established 6-column grid and footer spacing:
  `mt-4 pt-3 border-t gap-2`. Complex forms use a dedicated page.
- Descriptions and detailed addresses use `Textarea`, not a single-line input.
- Dialogs live in `src/components/dialog/`; fixed UI text must be translated.
- Use accessible labels, descriptions, focus management, keyboard behavior, and error
  announcement. Do not replace a semantic control with a styled `div`.
- Use semantic variants/tokens; do not fork a primitive for one screen without a
  reusable need.
