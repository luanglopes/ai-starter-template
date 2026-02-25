# AGENTS.md

## Scope

Rules for agents working inside the web frontend folder.

## Frontend Work Rules

- Preserve existing UI patterns and interaction behavior unless changes are requested.
- Prefer focused component/service edits over broad refactors.
- Keep presentation, state, and API integration concerns clearly separated.
- Maintain consistent error/loading/empty states when changing user flows.

## Svelte and Code Organization

- Use the project's current Svelte syntax and conventions consistently.
- Do not create barrel files unless explicitly requested.
- Import directly from concrete files.
- Keep feature-specific logic close to the feature instead of moving it into unrelated shared modules.

## UX and Accessibility

- Preserve keyboard accessibility and visible focus behavior.
- Use semantic HTML where possible.
- Avoid regressions in responsive behavior when adjusting layouts.
- Respect reduced-motion preferences when adding motion.

## Validation

- Verify changed UI behavior with the smallest relevant checks when feasible.
- If a change affects API integration, note any assumptions about response contracts.
- If validation is skipped, say exactly what was not checked.
