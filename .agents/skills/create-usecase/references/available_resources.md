# Available Resources in App Layer

This document lists the existing DAOs, domain models, providers, and errors available for reuse when creating use cases.

## Domain Models

Located in `src/app/domain/`

### Todo (`src/app/domain/Todo.ts`)
```typescript
export type Todo = {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	ownerId: string;
};
```

## Data Access Objects (DAOs)

Located in `src/app/dao/`

### TodoDAO (`src/app/dao/TodoDAO.ts`)
```typescript
export interface TodoDAO {
	getById(id: string): Promise<Todo | null>;
	findByOwnerId(params: ListTodosByOwnerIdParams): Promise<{ result: Todo[]; total: number }>;
	create(todo: CreateTodoParams): Promise<Todo>;
	update(params: UpdateTodoParams): Promise<Todo>;
	delete(id: string): Promise<void>;
}

export type ListTodosByOwnerIdParams = {
	ownerId: string;
	limit: number;
	offset: number;
	orderBy?: keyof Todo;
	orderDirection?: "asc" | "desc";
};

export type CreateTodoParams = Omit<Todo, "id">;

export type UpdateTodoParams = {
	id: string;
} & Partial<Omit<Todo, "id" | "ownerId">>;
```

**When to create a new DAO:**
- When working with a completely new domain entity (e.g., User, Project, Comment)
- When the existing DAOs don't provide the data access patterns needed

**When to extend an existing DAO:**
- When adding new query methods to an existing entity
- Update the DAO interface in `src/app/dao/` and implement it in `src/infra/drizzle/dao/`

## Providers

Located in `src/app/providers/`

### AIProvider (`src/app/providers/AIProvider.ts`)
```typescript
export interface AIProvider {
	generateText(prompt: string, options?: GenerateTextOptions): Promise<string>;
}

export type GenerateTextOptions = {
	maxTokens?: number;
	temperature?: number;
};
```

**Example usage in a use case:**
```typescript
export class EnhanceTodoDescription implements EnhanceTodoDescriptionUseCase {
	constructor(
		private todoDAO: TodoDAO,
		private aiProvider: AIProvider,
	) {}

	async execute(params: EnhanceTodoDescriptionInput): Promise<EnhanceTodoDescriptionOutput> {
		const todo = await this.todoDAO.getById(params.todoId);

		if (!todo) {
			throw new NotFoundError("Todo not found");
		}

		const enhancedDescription = await this.aiProvider.generateText(
			`Enhance this todo description: ${todo.description}`,
			{ maxTokens: 200 }
		);

		const updatedTodo = await this.todoDAO.update({
			id: params.todoId,
			description: enhancedDescription,
		});

		return { todo: updatedTodo };
	}
}
```

**When to create a new provider:**
- When integrating a new external service (e.g., EmailProvider, PaymentProvider, StorageProvider)
- Define the interface in `src/app/providers/`
- Implement it in `src/infra/` (e.g., `src/infra/sendgrid/SendGridEmailProvider.ts`)

## Domain Errors

Located in `src/app/domain/errors.ts`

All custom error classes extend the base `Error` class:

### NotFoundError
```typescript
export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}
```
**Use when:** Resource is not found in the database

### UnauthenticatedError
```typescript
export class UnauthenticatedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnauthenticatedError";
	}
}
```
**Use when:** User is not logged in or session is invalid

### UnauthorizedError
```typescript
export class UnauthorizedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnauthorizedError";
	}
}
```
**Use when:** User lacks permission to perform an action (e.g., updating someone else's todo)

### ConflictError
```typescript
export class ConflictError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ConflictError";
	}
}
```
**Use when:** Resource conflict (e.g., duplicate email, version conflict)

### ValidationError
```typescript
export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}
```
**Use when:** Input validation fails (e.g., empty title, invalid format)

## Creating New Resources

### When to create a new Domain Model

Create a new domain model in `src/app/domain/` when:
- Introducing a new business entity (e.g., User, Project, Comment)
- The entity represents a core business concept
- Keep it simple - just the type definition

Example:
```typescript
// src/app/domain/Project.ts
export type Project = {
	id: string;
	name: string;
	description?: string;
	ownerId: string;
	createdAt: Date;
	updatedAt: Date;
};
```

### When to create a new DAO

Create a new DAO interface in `src/app/dao/` when:
- You have a new domain model that needs persistence
- You need a different data access pattern not covered by existing DAOs

Example:
```typescript
// src/app/dao/ProjectDAO.ts
import type { Project } from "../domain/Project";

export interface ProjectDAO {
	getById(id: string): Promise<Project | null>;
	findByOwnerId(ownerId: string): Promise<Project[]>;
	create(project: CreateProjectParams): Promise<Project>;
	update(params: UpdateProjectParams): Promise<Project>;
	delete(id: string): Promise<void>;
}

export type CreateProjectParams = Omit<Project, "id" | "createdAt" | "updatedAt">;

export type UpdateProjectParams = {
	id: string;
} & Partial<Omit<Project, "id" | "ownerId" | "createdAt" | "updatedAt">>;
```

**Note:** After creating the DAO interface, you'll need to implement it in `src/infra/drizzle/dao/`, but that's outside the scope of this skill.

### When to create a new Provider

Create a new provider interface in `src/app/providers/` when:
- Integrating with an external service or API
- The service provides functionality used across multiple use cases

Example:
```typescript
// src/app/providers/EmailProvider.ts
export interface EmailProvider {
	sendEmail(params: SendEmailParams): Promise<void>;
}

export type SendEmailParams = {
	to: string;
	subject: string;
	body: string;
	from?: string;
};
```

**Note:** After creating the provider interface, you'll need to implement it in `src/infra/`, but that's outside the scope of this skill.

### When to create a new Domain Error

Create a new domain error in `src/app/domain/errors.ts` when:
- You need a new HTTP status code mapping
- The existing errors don't accurately represent the business rule violation

Example:
```typescript
// Add to src/app/domain/errors.ts
export class RateLimitError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "RateLimitError";
	}
}
```

**Note:** You'll also need to add the error mapping in the HTTP error handler (`src/interfaces/http/utils/errorHandler.ts`), but that's outside the scope of this skill.
