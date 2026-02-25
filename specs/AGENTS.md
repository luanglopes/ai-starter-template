# AGENTS.md

## Scope

Rules for agents working inside the specifications folder.

## Specification Rules

- Treat specs as source of intent, constraints, and decisions, not implementation code.
- Separate current behavior from proposed changes.
- State assumptions, open questions, and non-goals explicitly.
- Prefer precise acceptance criteria over vague descriptions.
- Keep requirements testable and falsifiable.

## Change Management

- Update impacted specs when a task changes architecture, behavior, or contracts.
- Do not silently rewrite prior decisions; record revisions clearly.
- Preserve traceability between problem statement, decision, and consequences.
- If implementation diverges from spec, note the mismatch instead of hiding it.

## Writing Quality

- Use concise language and avoid marketing phrasing.
- Use consistent terms for entities, actions, and states.
- Favor structured lists/tables only when they improve clarity.
