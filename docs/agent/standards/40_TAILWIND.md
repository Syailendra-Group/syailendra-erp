# Tailwind CSS Standards

- Follow the installed Tailwind major version; project currently uses Tailwind CSS v4.
- Use semantic design tokens and existing project CSS variables. Avoid literal hex,
  RGB, or arbitrary colors in component classes.
- Prefer a small set of reusable layout patterns; avoid long, contradictory class lists.
- Keep responsive and state variants explicit; verify touch and keyboard states.
- Use `cn()` / established class merge helper when composing conditional classes.
- Do not add a custom CSS rule when an existing design token and utility class is
  sufficient; add CSS for genuinely complex or shared behavior only.
