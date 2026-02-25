# Migration Checklist

1. Confirm supported locales and default locale.
2. Add/verify i18n core module (`config`, `types`, `loader`, `I18nStore`).
3. Add lazy-loaded locale dictionaries (`en`, `pt-BR`).
4. Initialize i18n in root layout and gate render by i18n readiness.
5. Migrate auth strings:
- Pages: login/signup/forgot/reset/verify
- Components: AuthLayout, UserMenu
- Stores: auth + form validation messages
6. Migrate todos strings:
- Todos page and TodoList component
7. Migrate settings strings:
- Settings page, profile/password/billing/danger zone
- Modals: delete account, email verification
8. Migrate shared strings:
- Legal disclaimer and global nav labels
9. Ensure validation schema text updates with locale changes.
10. Add or verify language selector UI.
11. Run `cd web && bun run check`.
12. Manually verify locale switch at runtime on auth, todos, and settings screens.
