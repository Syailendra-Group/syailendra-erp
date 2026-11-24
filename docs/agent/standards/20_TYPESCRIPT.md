# TypeScript Standards

## Strict typing

- Keep `strict` mode enabled; do not weaken compiler options to make a feature pass.
- Do not use `any`; use `unknown` and narrow, or define a proper domain type.
- Shared domain types are stored under `src/types/`; feature-level types that cross
  boundaries belong there rather than being duplicated.
- Prefer discriminated unions for state and result types; avoid unchecked assertions.
- Validate external Odoo/Accurate responses at runtime, because TypeScript types do
  not validate JSON payloads.

## Naming and API contracts

- Use English names and Odoo's established model/field names where applicable.
- Export explicit types for service/action contracts.
- Use `import type` for type-only imports.
- Avoid `enum` for simple finite sets if a string-literal union is clearer.
- Represent money, weights, and units explicitly; do not silently mix currencies or
  measurement units.

## Errors and async work

- Catch `unknown`; narrow `instanceof Error` and map to a safe typed result.
- Do not swallow errors or return `undefined` for unexpected failures.
- Use `Promise.all` only for independent tasks; preserve transaction/order dependencies.
- Keep public function return types explicit and domain contracts documented.
