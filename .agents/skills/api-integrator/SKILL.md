---
name: api-integrator
description: Generate TypeScript services and DTOs from docs/API.md documentation for SvelteKit projects. Use when the user asks to (1) integrate API endpoints, (2) create services from docs/API.md, (3) generate types from API documentation, or (4) scaffold API client code. Automatically reads docs/API.md in the project root, parses endpoint definitions, and generates neverthrow Result-based services following established patterns.
---

# API Integrator

## Overview

This skill generates TypeScript service layer code and Data Transfer Objects (DTOs) from docs/API.md documentation for SvelteKit projects using neverthrow Result types.

Resolve the web package root first (for example `code/web` or `web`) and run generated file operations there. Resolve the repository root separately for `docs/API.md`.

## Workflow

### 1. Locate and Read docs/API.md

Read the docs/API.md file from the project root to understand available endpoints.

```bash
# docs/API.md is typically at project root
cat docs/API.md
```

If docs/API.md doesn't exist, inform the user and ask if they want to create it or provide alternative documentation.

### 2. Identify Target Resource

Ask the user which resource/feature to generate code for:

- List available resources from docs/API.md (e.g., "Todos", "Users", "Posts")
- Confirm feature name for the output directory (e.g., "todos" → `src/lib/todos/`)

### 3. Extract Endpoint Information

For the target resource, parse docs/API.md to extract:

- HTTP methods (GET, POST, PATCH, DELETE)
- Endpoint paths (e.g., `/api/todos`, `/api/todos/:id`)
- URL parameters (`:id`, `:slug`)
- Query parameters (`limit`, `offset`)
- Request body schemas
- Response schemas
- Validation rules
- Data models

**See [api-md-format.md](references/api-md-format.md) for parsing patterns and strategies.**

### 4. Generate DTOs

Create DTO files in `src/lib/[feature]/dtos/`:

1. Identify entity types from the Data Models section
2. Create one `.ts` file per entity
3. Use TypeScript types (not interfaces)
4. Mark optional fields with `?:`

Example:

```typescript
// src/lib/todos/dtos/Todo.ts
export type Todo = {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	ownerId: string;
};
```

### 5. Generate Services

Create service files in `src/lib/[feature]/services/`:

1. One file per endpoint operation
2. Name files after the operation (e.g., `createTodo.ts`, `listTodos.ts`)
3. Use neverthrow Result pattern
4. Export input and response types alongside the service function

**See [service-patterns.md](references/service-patterns.md) for complete implementation patterns.**

Key requirements:

- Import `api` from `$lib/common/api`
- Import `err`, `ok`, `Result` from `neverthrow`
- Import `ErrorResponse` from `$lib/common/types`
- Return `Promise<Result<ResponseType, ErrorResponse>>`
- Check `!response.ok` and return `err(data)` for errors
- Return `ok(data)` for success

### 6. Verify ErrorResponse Type

Check if `src/lib/common/types.ts` exists and contains `ErrorResponse`:

```typescript
export type ErrorResponse = {
	error: string;
	type: string;
};
```

If it doesn't exist, create it.

### 7. Create Directory Structure

Ensure the following structure:

```
src/lib/[feature]/
├── dtos/
│   └── EntityName.ts
└── services/
    ├── create.ts
    ├── list.ts
    ├── getById.ts
    ├── update.ts
    └── delete.ts
```

### 8. Summary and Next Steps

After generating files:

1. List all created files with their paths
2. Suggest testing the services in a Svelte component
3. Remind about error handling with `.isOk()` and `.isErr()`

Example usage:

```typescript
const result = await createTodo({ title: 'Buy milk' });

if (result.isErr()) {
	console.error(result.error);
	return;
}

const { todo } = result.value;
```

## HTTP Method Mapping

- `GET` → `api.get(url, params?)`
- `POST` → `api.post(url, body)`
- `PATCH` → `api.patch(url, body)`
- `DELETE` → `api.delete(url)`

## Type Naming Conventions

- **DTOs**: `EntityName` (e.g., `Todo`, `User`)
- **Services**: `operationName` (e.g., `createTodo`, `listUsers`)
- **Input types**: `OperationInput` or `OperationParams`
- **Response types**: `OperationResponse`

## References

- **[service-patterns.md](references/service-patterns.md)**: Complete service implementation patterns, neverthrow usage, and file organization
- **[api-md-format.md](references/api-md-format.md)**: docs/API.md document structure and parsing strategies
