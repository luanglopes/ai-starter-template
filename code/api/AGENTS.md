# AGENTS.md

## Scope

Rules for agents working inside the API backend folder.

## API Work Rules

- Keep HTTP handlers/controllers thin and move business logic into use cases/services.
- Validate request input and output contracts consistently.
- Prefer small, composable changes over broad backend rewrites.
- Preserve existing error handling patterns and response shapes unless a change is requested.
- Do not mix infrastructure concerns into domain/business logic unnecessarily.

## Data and Persistence

- Make schema/DAO changes only when required by the task.
- Keep migrations and schema updates aligned when persistence changes are made.
- Avoid silent behavioral changes in existing queries, filters, or ordering.
- Be explicit about backward compatibility risks for database changes.

## Testing and Verification

- Add or update backend tests when behavior changes.
- Prioritize targeted unit/integration coverage for touched endpoints/use cases.
- If you cannot run tests locally, state what was not verified.

## Safety

- Do not expose secrets, tokens, or environment values in code or logs.
- Do not weaken auth, authorization, or validation behavior without explicit user approval.
- Flag any API contract change that may impact clients.
