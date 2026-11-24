# Internationalization and Accessibility

## i18n

- UI strings must be keys in `src/messages/id/` and `src/messages/en/`.
- Both locale dictionaries must have identical key paths and appropriate translations.
- Avoid embedded text in labels, validation, toasts, menus, empty states, table columns,
  PDF labels, and metadata.
- Business values (model states, codes) remain stable identifiers; translate only the
  display label.
- Dates, numbers, currencies, weights, and time zones use locale-aware formatting.

## Accessibility

- Use semantic HTML, associated labels, accessible names, and keyboard-operable controls.
- Preserve visible focus states, logical tab order, contrast, and error descriptions.
- Tables need captions/headers and proper loading/empty/error state semantics.
- Color is never the only signal for QC status or warnings.
- PDF labels must remain readable at intended print size and include text equivalents
  where practical.
