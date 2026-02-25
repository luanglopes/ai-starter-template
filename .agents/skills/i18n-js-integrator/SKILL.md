---
name: i18n-js-integrator
description: Add or migrate internationalization in the SvelteKit web template using i18n-js. Use when users ask to add i18n, translate UI, support multiple languages, lazy-load locale dictionaries, or localize validation/toast text.
---

# i18n-js Integrator

## Scope
- Resolve the web package root first (for example `code/web` or `web`) and run file changes there.
- Focus on the web package.
- Keep API payload/error localization out of scope unless explicitly requested.
- Follow project conventions: Svelte 5 runes, no barrel files, direct imports.

## Workflow
1. Inspect current user-facing strings in routes, components, stores, and validation schemas.
2. Ensure i18n core exists in `src/lib/common/i18n/`:
- `config.ts` with i18n-js singleton, fallback enabled, default locale `en`.
- `types.ts` with `AppLocale`, supported locales, and default locale.
- `loader.ts` with lazy imports per locale and cache.
- `I18nStore.svelte.ts` with `locale`, `ready`, `loading`, `version`, `init()`, `setLocale()`, and `t()`.
3. Create/update locale files:
- `src/lib/common/i18n/locales/en.ts`
- `src/lib/common/i18n/locales/pt-BR.ts`
4. Bootstrap in root layout:
- Call `i18nStore.init()` once.
- Gate app rendering with i18n readiness to avoid wrong-locale flash.
5. Migrate strings to keys:
- Auth pages/components/stores
- Todos pages/components/stores
- Settings pages/components/stores
- Shared visible text
6. Localize validation:
- Build Valibot schemas via functions that call `t(...)`.
- Ensure validation refreshes current schema before parse/field validation.
7. Add/maintain locale selector UI (settings page by default).
8. Run checks from the web package root (`bun run check`) and fix type issues.

## Key conventions
- Translation keys are namespaced by feature:
- `common.*`, `navigation.*`, `auth.*`, `validation.*`, `todos.*`, `settings.*`, `userMenu.*`
- Use interpolation for dynamic values (`%{email}`, `%{time}`).
- Keep technical identifiers stable (`free|starter|pro`) and localize display names via keys.

## References
- Key naming rules: `references/key-naming.md`
- Migration checklist: `references/migration-checklist.md`
