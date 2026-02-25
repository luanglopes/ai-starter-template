# Controller Patterns

This document contains reference examples of HTTP controller patterns used in this codebase.

## Controller Structure

All controllers are located in `src/interfaces/http/controllers/` and follow a consistent pattern:

1. Static `path` property - The route path
2. Static `schema` property - Valibot validation schemas
3. Constructor - Receives the use case instance
4. `handle` method - Processes the request and returns response
5. Type alias for context - Type-safe request context

## Complete Controller Examples

### POST Request with JSON Body (CreateTodo)

```typescript
import * as v from "valibot";
import type { CreateTodoUseCase } from "../../../app/usecases/CreateTodo";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class CreateTodoController {
	static readonly path = "/todos";
	static readonly schema = {
		json: v.object({
			title: v.pipe(v.string(), v.trim(), v.minLength(3)),
			description: v.optional(v.string()),
		}),
	};

	constructor(private createTodoUseCase: CreateTodoUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);

			const payload = ctx.req.valid("json");

			const result = await this.createTodoUseCase.execute({
				ownerId: session.user.id,
				title: payload.title,
				description: payload.description,
			});

			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof CreateTodoController.path,
	typeof CreateTodoController.schema
>;
```

### PATCH Request with JSON Body and Path Parameter (UpdateTodo)

```typescript
import * as v from "valibot";
import type { UpdateTodoUseCase } from "../../../app/usecases/UpdateTodo";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class UpdateTodoController {
	static readonly path = "/todos/:id";
	static readonly schema = {
		json: v.object({
			title: v.optional(v.pipe(v.string(), v.trim(), v.minLength(3))),
			description: v.optional(v.string()),
			completed: v.optional(v.boolean()),
		}),
		param: v.object({
			id: v.string(),
		}),
	};

	constructor(private updateTodoUseCase: UpdateTodoUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const payload = ctx.req.valid("json");
			const { id } = ctx.req.valid("param");

			const result = await this.updateTodoUseCase.execute({
				id,
				ownerId: session.user.id,
				title: payload.title,
				description: payload.description,
				completed: payload.completed,
			});

			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof UpdateTodoController.path,
	typeof UpdateTodoController.schema
>;
```

### GET Request without Validation (ListTodos)

```typescript
import type { ListTodosUseCase } from "../../../app/usecases/ListTodos";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class ListTodosController {
	static readonly path = "/todos";
	static readonly schema = {};

	constructor(private listTodosUseCase: ListTodosUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);

			const result = await this.listTodosUseCase.execute({
				ownerId: session.user.id,
			});

			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof ListTodosController.path,
	typeof ListTodosController.schema
>;
```

### DELETE Request with Path Parameter (DeleteTodo)

```typescript
import * as v from "valibot";
import type { DeleteTodoUseCase } from "../../../app/usecases/DeleteTodo";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class DeleteTodoController {
	static readonly path = "/todos/:id";
	static readonly schema = {
		param: v.object({
			id: v.string(),
		}),
	};

	constructor(private deleteTodoUseCase: DeleteTodoUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const { id } = ctx.req.valid("param");

			await this.deleteTodoUseCase.execute({
				id,
				ownerId: session.user.id,
			});

			return createJsonResponse({ success: true });
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof DeleteTodoController.path,
	typeof DeleteTodoController.schema
>;
```

### GET Request with Path Parameter (GetTodoDetails)

```typescript
import * as v from "valibot";
import type { GetTodoDetailsUseCase } from "../../../app/usecases/GetTodoDetails";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class GetTodoDetailsController {
	static readonly path = "/todos/:id";
	static readonly schema = {
		param: v.object({
			id: v.string(),
		}),
	};

	constructor(private getTodoDetailsUseCase: GetTodoDetailsUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const { id } = ctx.req.valid("param");

			const result = await this.getTodoDetailsUseCase.execute({
				id,
				ownerId: session.user.id,
			});

			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof GetTodoDetailsController.path,
	typeof GetTodoDetailsController.schema
>;
```

## Validation Schema Patterns (Valibot)

### Common Validations

```typescript
import * as v from "valibot";

// Required string with minimum length
title: v.pipe(v.string(), v.trim(), v.minLength(3))

// Optional string
description: v.optional(v.string())

// Boolean
completed: v.optional(v.boolean())

// Number with range
age: v.pipe(v.number(), v.minValue(0), v.maxValue(150))

// Email
email: v.pipe(v.string(), v.email())

// URL
website: v.pipe(v.string(), v.url())

// Enum
status: v.picklist(["pending", "completed", "cancelled"])

// Date string
dueDate: v.pipe(v.string(), v.isoDate())

// UUID
id: v.pipe(v.string(), v.uuid())

// Array of strings
tags: v.array(v.string())

// Nested object
address: v.object({
	street: v.string(),
	city: v.string(),
	zip: v.pipe(v.string(), v.regex(/^\d{5}$/)),
})
```

### Schema Types

**JSON Body:**
```typescript
static readonly schema = {
	json: v.object({
		// fields...
	}),
};
```

**Path Parameters:**
```typescript
static readonly schema = {
	param: v.object({
		id: v.string(),
	}),
};
```

**Query Parameters:**
```typescript
static readonly schema = {
	query: v.object({
		limit: v.optional(v.pipe(v.string(), v.transform(Number))),
		offset: v.optional(v.pipe(v.string(), v.transform(Number))),
	}),
};
```

**Multiple Schema Types:**
```typescript
static readonly schema = {
	json: v.object({
		title: v.string(),
	}),
	param: v.object({
		id: v.string(),
	}),
	query: v.object({
		expand: v.optional(v.boolean()),
	}),
};
```

## Router Registration Pattern

Located in `src/interfaces/http/router.ts`:

```typescript
import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { CreateTodo } from "../../app/usecases/CreateTodo";
import { getConnection } from "../../infra/drizzle/connection";
import { getTodoDAO } from "../../infra/factories/DAOFactory";
import type { AppEnv } from "./AppContext";
import { CreateTodoController } from "./controllers/CreateTodo";

export const apiRouter = new Hono<AppEnv>()
	// POST /api/todos
	.post(
		CreateTodoController.path,
		sValidator("json", CreateTodoController.schema.json),
		(c) => {
			const db = getConnection(c.env);
			const todoDAO = getTodoDAO(db);
			const useCase = new CreateTodo(todoDAO);
			return new CreateTodoController(useCase).handle(c);
		},
	)
	// PATCH /api/todos/:id
	.patch(
		UpdateTodoController.path,
		sValidator("json", UpdateTodoController.schema.json),
		sValidator("param", UpdateTodoController.schema.param),
		(c) => {
			const db = getConnection(c.env);
			const todoDAO = getTodoDAO(db);
			const useCase = new UpdateTodo(todoDAO);
			return new UpdateTodoController(useCase).handle(c);
		},
	)
	// GET /api/todos
	.get(ListTodosController.path, (c) => {
		const db = getConnection(c.env);
		const todoDAO = getTodoDAO(db);
		const useCase = new ListTodos(todoDAO);
		return new ListTodosController(useCase).handle(c);
	})
	// DELETE /api/todos/:id
	.delete(
		DeleteTodoController.path,
		sValidator("param", DeleteTodoController.schema.param),
		(c) => {
			const db = getConnection(c.env);
			const todoDAO = getTodoDAO(db);
			const useCase = new DeleteTodo(todoDAO);
			return new DeleteTodoController(useCase).handle(c);
		},
	);
```

### Router Patterns

**No validation:**
```typescript
.get(ControllerName.path, (c) => {
	// setup...
	return new ControllerName(useCase).handle(c);
})
```

**Single validator:**
```typescript
.post(
	ControllerName.path,
	sValidator("json", ControllerName.schema.json),
	(c) => {
		// setup...
		return new ControllerName(useCase).handle(c);
	},
)
```

**Multiple validators:**
```typescript
.patch(
	ControllerName.path,
	sValidator("json", ControllerName.schema.json),
	sValidator("param", ControllerName.schema.param),
	(c) => {
		// setup...
		return new ControllerName(useCase).handle(c);
	},
)
```

## Key Principles

1. **Static Properties** - `path` and `schema` are static readonly
2. **Constructor Injection** - Use case injected via constructor
3. **Type Safety** - Use `AppContext` with path and schema types
4. **Error Handling** - Always use try/catch with `createErrorResponse`
5. **Authentication** - Always call `getSession(ctx)` to get user
6. **Validation** - Use Valibot schemas for all input validation
7. **Response Format** - Use `createJsonResponse` for success responses
8. **Naming** - Controller class name matches use case name + "Controller"

## Response Patterns

### Success Response

```typescript
return createJsonResponse(result);
```

### Success with Custom Status

```typescript
return createJsonResponse(result, 201);
```

### Error Response

```typescript
catch (error) {
	return createErrorResponse(ctx, error as Error);
}
```

The error handler automatically maps domain errors to HTTP status codes:
- `NotFoundError` → 404
- `UnauthenticatedError` → 401
- `UnauthorizedError` → 403
- `ConflictError` → 409
- `ValidationError` → 400
- All others → 500
