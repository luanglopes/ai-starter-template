# Use Case Patterns

This document contains reference examples of the use case patterns used in this codebase.

## File Structure Pattern

Each use case follows this directory structure:

```
src/app/usecases/UseCaseName/
├── UseCaseName.ts      # Main use case class implementation
├── UseCaseName.spec.ts # Unit tests with mocked dependencies
├── types.ts            # TypeScript type definitions (Input, Output, UseCase interface)
└── index.ts            # Named exports
```

## Example: CreateTodo Use Case

### types.ts
```typescript
import type { Todo } from "../../domain/Todo";

export interface CreateTodoUseCase {
	execute(params: CreateTodoInput): Promise<CreateTodoOutput>;
}

export type CreateTodoInput = {
	ownerId: string;
	title: string;
	description?: string;
};

export type CreateTodoOutput = {
	todo: Todo;
};
```

### CreateTodo.ts
```typescript
import type { TodoDAO } from "../../dao/TodoDAO";
import { ValidationError } from "../../domain/errors";
import type {
	CreateTodoInput,
	CreateTodoOutput,
	CreateTodoUseCase,
} from "./types";

export class CreateTodo implements CreateTodoUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: CreateTodoInput): Promise<CreateTodoOutput> {
		const { ownerId, title, description } = params;

		const trimmedTitle = title.trim();

		if (trimmedTitle.length === 0) {
			throw new ValidationError("Title should not be empty");
		}

		if (trimmedTitle.length < 3) {
			throw new ValidationError("Title should have at least 3 characters");
		}

		const todo = await this.todoDAO.create({
			ownerId,
			title: trimmedTitle,
			description,
			completed: false,
		});

		return { todo };
	}
}
```

### index.ts
```typescript
export * from "./CreateTodo";
export * from "./types";
```

### CreateTodo.spec.ts
```typescript
import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";
import type { TodoDAO } from "../../dao/TodoDAO";
import type { Todo } from "../../domain/Todo";
import { CreateTodo } from "./CreateTodo";
import type { CreateTodoInput } from "./types";

describe("CreateTodo", () => {
	let createTodo: CreateTodo;
	let mockTodoDAO: Mocked<TodoDAO>;

	beforeEach(() => {
		mockTodoDAO = {
			create: vi.fn(),
			getById: vi.fn(),
			findByOwnerId: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		};
		createTodo = new CreateTodo(mockTodoDAO);
	});

	describe("validation rules", () => {
		it("should throw error when title is empty", async () => {
			const input: CreateTodoInput = {
				ownerId: "user-123",
				title: "",
				description: "Test description",
			};

			await expect(createTodo.execute(input)).rejects.toThrow(
				"Title should not be empty",
			);

			expect(mockTodoDAO.create).not.toHaveBeenCalled();
		});

		it("should throw error when title has less than 3 characters", async () => {
			const input: CreateTodoInput = {
				ownerId: "user-123",
				title: "ab",
				description: "Test description",
			};

			await expect(createTodo.execute(input)).rejects.toThrow(
				"Title should have at least 3 characters",
			);

			expect(mockTodoDAO.create).not.toHaveBeenCalled();
		});
	});

	describe("successful creation", () => {
		it("should create todo with completed set to false", async () => {
			const input: CreateTodoInput = {
				ownerId: "user-123",
				title: "Valid Title",
				description: "Test description",
			};

			const expectedTodo: Todo = {
				id: "todo-1",
				ownerId: "user-123",
				title: "Valid Title",
				description: "Test description",
				completed: false,
			};

			mockTodoDAO.create.mockResolvedValue(expectedTodo);

			const result = await createTodo.execute(input);

			expect(mockTodoDAO.create).toHaveBeenCalledWith({
				ownerId: "user-123",
				title: "Valid Title",
				description: "Test description",
				completed: false,
			});

			expect(result.todo).toEqual(expectedTodo);
			expect(result.todo.completed).toBe(false);
		});
	});
});
```

## Example: UpdateTodo Use Case (with authorization)

### UpdateTodo.ts
```typescript
import type { TodoDAO } from "../../dao/TodoDAO";
import {
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "../../domain/errors";
import type {
	UpdateTodoInput,
	UpdateTodoOutput,
	UpdateTodoUseCase,
} from "./types";

export class UpdateTodo implements UpdateTodoUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: UpdateTodoInput): Promise<UpdateTodoOutput> {
		const { id, ownerId, title, description, completed } = params;

		// Get existing todo
		const existingTodo = await this.todoDAO.getById(id);

		if (!existingTodo) {
			throw new NotFoundError("Todo not found");
		}

		// Check ownership
		if (existingTodo.ownerId !== ownerId) {
			throw new UnauthorizedError("You can only update your own todos");
		}

		// Validate title if provided
		if (title !== undefined) {
			const trimmedTitle = title.trim();

			if (trimmedTitle.length === 0) {
				throw new ValidationError("Title should not be empty");
			}

			if (trimmedTitle.length < 3) {
				throw new ValidationError("Title should have at least 3 characters");
			}
		}

		const todo = await this.todoDAO.update({
			id,
			title: title !== undefined ? title.trim() : undefined,
			description,
			completed,
		});

		return { todo };
	}
}
```

## Example: ListTodos Use Case (with pagination)

### types.ts
```typescript
import type { Todo } from "../../domain/Todo";

export interface ListTodosUseCase {
	execute(params: ListTodosInput): Promise<ListTodosOutput>;
}

export type ListTodosInput = {
	ownerId: string;
	limit?: number;
	offset?: number;
};

export type ListTodosOutput = {
	todos: Todo[];
	total: number;
};
```

### ListTodos.ts
```typescript
import type { TodoDAO } from "../../dao/TodoDAO";
import type {
	ListTodosInput,
	ListTodosOutput,
	ListTodosUseCase,
} from "./types";

export class ListTodos implements ListTodosUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: ListTodosInput): Promise<ListTodosOutput> {
		const { ownerId, limit = 100, offset = 0 } = params;

		const { result: todos, total } = await this.todoDAO.findByOwnerId({
			ownerId,
			limit,
			offset,
		});

		return {
			todos,
			total,
		};
	}
}
```

## Available Domain Errors

Located in `src/app/domain/errors.ts`:

- `NotFoundError` - Resource not found (404)
- `UnauthenticatedError` - User not authenticated (401)
- `UnauthorizedError` - User not authorized to perform action (403)
- `ConflictError` - Resource conflict (409)
- `ValidationError` - Input validation failed (400)

## Testing Patterns

### Mocking DAOs
```typescript
let mockTodoDAO: Mocked<TodoDAO>;

beforeEach(() => {
	mockTodoDAO = {
		create: vi.fn(),
		getById: vi.fn(),
		findByOwnerId: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	};
});
```

### Testing Validation
```typescript
it("should throw error when validation fails", async () => {
	const input: CreateTodoInput = {
		ownerId: "user-123",
		title: "",
	};

	await expect(createTodo.execute(input)).rejects.toThrow(
		"Title should not be empty",
	);

	expect(mockTodoDAO.create).not.toHaveBeenCalled();
});
```

### Testing Success Cases
```typescript
it("should successfully execute", async () => {
	const input: CreateTodoInput = {
		ownerId: "user-123",
		title: "Valid Title",
	};

	const expectedOutput: Todo = {
		id: "todo-1",
		ownerId: "user-123",
		title: "Valid Title",
		completed: false,
	};

	mockTodoDAO.create.mockResolvedValue(expectedOutput);

	const result = await createTodo.execute(input);

	expect(mockTodoDAO.create).toHaveBeenCalledWith({
		ownerId: "user-123",
		title: "Valid Title",
		description: undefined,
		completed: false,
	});

	expect(result.todo).toEqual(expectedOutput);
});
```

## Key Principles

1. **Single Responsibility**: Each use case handles one specific business operation
2. **Dependency Injection**: All dependencies (DAOs, providers) are injected via constructor
3. **Domain-Driven Design**: Use domain errors for business rule violations
4. **Type Safety**: Strong typing for inputs and outputs
5. **Testability**: All dependencies are mockable interfaces
6. **Validation**: Validate inputs and throw appropriate domain errors
7. **Authorization**: Check permissions before executing operations
