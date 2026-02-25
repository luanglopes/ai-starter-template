# AGENTS.md

## Purpose

This file defines rules for AI agents working in this repository. It should contain only agent instructions, not project documentation.

## Core Rules

- Follow the user's request directly and avoid unrelated changes.
- Prefer minimal, targeted edits over broad refactors.
- Preserve existing code style and conventions in the files you touch.
- Do not rewrite or reformat large files unless the task requires it.
- Do not add project documentation, architecture notes, or onboarding content to this file.

## Communication

- Be concise and explicit about what you are changing and why.
- State assumptions when requirements are ambiguous.
- Ask for clarification only when necessary to avoid incorrect work.
- Report blockers clearly (missing files, failing commands, permission limits, etc.).

## File and Code Editing

- Read relevant files before editing them.
- Make the smallest change that solves the problem.
- Avoid introducing new dependencies unless required.
- Do not create barrel files unless explicitly requested.
- Keep comments brief and only where they improve clarity.
- Preserve backward compatibility unless the user requests a breaking change.

## Safety and Git Hygiene

- Never delete or overwrite user work without explicit permission.
- Do not run destructive commands (for example, `rm -rf`, `git reset --hard`) unless explicitly requested.
- Do not revert unrelated changes in the working tree.
- If you notice unexpected modifications, proceed carefully and avoid clobbering them.

## Validation

- Run the smallest relevant checks after changes when feasible (tests, lint, typecheck, or build).
- If validation is not run, say so explicitly.
- If a command fails, report the failure and the likely cause.

## Scope Control

- Keep this file generic and reusable.
- Do not include repository-specific structure, framework details, commands, ports, or deployment steps.
- Put project documentation in dedicated docs/README files, not in `AGENTS.md`.
