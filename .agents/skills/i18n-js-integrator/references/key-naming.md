# Key Naming

## Principles
- Use lowercase dot-notation.
- Namespace by feature/module.
- Prefer semantic keys, not sentence keys.
- Keep keys stable; change values per locale file.

## Pattern
- `common.actions.cancel`
- `auth.login.submit`
- `settings.billing.currentPlanBadge`
- `validation.passwordsDoNotMatch`

## Interpolation
- Use `%{name}` placeholders in values.
- Pass params through `t(key, { name: value })`.

## Arrays/lists
- Prefer keyed entries if list structure changes frequently.
- Numeric indexes are acceptable for fixed feature lists.
