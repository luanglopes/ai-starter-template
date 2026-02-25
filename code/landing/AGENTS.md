# AGENTS.md

## Scope

Rules for agents working inside the landing/public marketing pages folder.

## Landing Page Rules

- Treat this area as public-facing UI work and preserve marketing copy intent unless edits are requested.
- Prefer static, simple implementations over framework-like abstractions.
- Keep pages fast to load and easy to maintain.
- Make focused edits to the specific page/section requested.

## Styling Rules

- Read the design system documentation before writing or changing styles.
- Use only approved design tokens for colors, spacing, typography, radius, and shadows.
- Do not introduce hardcoded style values when a token exists.
- Do not invent new design tokens without user approval.
- Prefer semantic tokens over primitive tokens when both are available.

## HTML and Accessibility

- Use semantic HTML structure and meaningful headings.
- Preserve keyboard accessibility and focus visibility.
- Include accessible labels/text alternatives for interactive or visual elements.
- Maintain responsive behavior across common viewport sizes.

## Content and SEO Safety

- Do not change legal copy, pricing claims, or SEO-critical metadata unless explicitly requested.
- Flag any change that could alter analytics hooks, structured data, or indexing behavior.

## Validation

- Check for obvious HTML/CSS regressions in the changed page(s).
- If visual verification is not performed, state that explicitly.
