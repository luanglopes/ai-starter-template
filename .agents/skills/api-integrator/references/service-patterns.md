# Service Layer Patterns

## Service Structure

Each service is a single TypeScript file that wraps an API endpoint using neverthrow Result types.

### Basic Service Pattern

```typescript
import { api } from '$lib/common/api';
import { err, ok, type Result } from 'neverthrow';
import type { ErrorResponse } from '$lib/common/types';
import type { EntityName } from '../dtos/EntityName';

export const operationName = async (
	params: OperationParams
): Promise<Result<OperationResponse, ErrorResponse>> => {
	const response = await api.method('/api/path', body);
	const data = await response.json();

	if (!response.ok) {
		return err(data);
	}

	return ok(data);
};

export type OperationParams = {
	// Input parameters
};

export type OperationResponse = {
	// Response fields
};
```

## HTTP Method Mapping

- `GET /api/resource` → `api.get('/api/resource', params)`
- `POST /api/resource` → `api.post('/api/resource', body)`
- `PATCH /api/resource/:id` → `api.patch('/api/resource/${id}', body)`
- `DELETE /api/resource/:id` → `api.delete('/api/resource/${id}')`

### URL Parameters

For endpoints with URL parameters (e.g., `/api/todos/:id`):

```typescript
export const getTodo = async (id: string): Promise<Result<GetTodoResponse, ErrorResponse>> => {
	const response = await api.get(`/api/todos/${id}`);
	// ...
};
```

### Query Parameters

For endpoints with query parameters:

```typescript
export type ListParams = {
	limit?: number;
	offset?: number;
};

export const list = async (params?: ListParams): Promise<Result<ListResponse, ErrorResponse>> => {
	const response = await api.get('/api/resource', params);
	// ...
};
```

## DTO (Data Transfer Object) Types

DTOs represent the data models returned by the API. Each entity gets a single DTO file.

```typescript
// src/lib/[feature]/dtos/EntityName.ts
export type EntityName = {
	id: string;
	field1: string;
	field2?: string;
	field3: boolean;
};
```

### Naming Conventions

- **DTOs**: PascalCase matching the entity name (e.g., `Todo`, `User`, `Post`)
- **Services**: camelCase describing the operation (e.g., `createTodo`, `listTodos`, `updateTodo`)
- **Service files**: Match the function name (e.g., `createTodo.ts`, `listTodos.ts`)
- **Input types**: `[Operation]Input` or `[Operation]Params` (e.g., `CreateTodoInput`, `ListTodosParams`)
- **Response types**: `[Operation]Response` (e.g., `CreateTodoResponse`, `ListTodosResponse`)

## Error Handling

All services use the neverthrow Result pattern:

```typescript
import type { Result } from 'neverthrow';
import type { ErrorResponse } from '$lib/common/types';

// Return type
Promise<Result<SuccessType, ErrorResponse>>;

// Error check
if (!response.ok) {
	return err(data);
}

// Success return
return ok(data);
```

### ErrorResponse Type

```typescript
export type ErrorResponse = {
	error: string;
	type: string;
};
```

## File Organization

```
src/lib/[feature]/
├── dtos/
│   └── EntityName.ts       # Data model types
└── services/
    ├── create.ts           # POST endpoint
    ├── list.ts             # GET collection endpoint
    ├── getById.ts          # GET single item endpoint
    ├── update.ts           # PATCH endpoint
    ├── delete.ts           # DELETE endpoint
    └── customOperation.ts  # Other operations
```

## Complete Example

Based on this API endpoint:

```markdown
### Create Todo

POST /api/todos

Request Body:
{
"title": "Buy groceries",
"description": "Milk, eggs" // optional
}

Response:
{
"todo": {
"id": "01JQWE123",
"title": "Buy groceries",
"description": "Milk, eggs",
"completed": false,
"ownerId": "user123"
}
}
```

Generate:

**DTO** (`src/lib/todos/dtos/Todo.ts`):

```typescript
export type Todo = {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	ownerId: string;
};
```

**Service** (`src/lib/todos/services/createTodo.ts`):

```typescript
import { api } from '$lib/common/api';
import { err, ok, type Result } from 'neverthrow';
import type { ErrorResponse } from '$lib/common/types';
import type { Todo } from '../dtos/Todo';

export const createTodo = async (
	data: CreateTodoInput
): Promise<Result<CreateTodoResponse, ErrorResponse>> => {
	const response = await api.post('/api/todos', data);
	const result = await response.json();

	if (!response.ok) {
		return err(result);
	}

	return ok(result);
};

export type CreateTodoInput = {
	title: string;
	description?: string;
};

export type CreateTodoResponse = {
	todo: Todo;
};
```
