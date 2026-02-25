# Integration Test Patterns

This document contains reference examples of integration test patterns used in this codebase.

## Test File Structure

All integration tests are located in `test/integration/{resource}/` and follow this structure:

```
test/integration/
├── todos/
│   ├── create.test.ts
│   ├── update.test.ts
│   ├── list.test.ts
│   ├── get.test.ts
│   └── delete.test.ts
└── helpers/
    ├── request-helper.ts
    ├── db-helper.ts
    └── service-locator-helper.ts
```

## Complete Integration Test Example

### POST /api/todos (Create)

```typescript
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { user } from "../../../src/infra/better-auth/auth-schema";
import { getConnection } from "../../../src/infra/drizzle/connection";
import { todoTable } from "../../../src/infra/drizzle/schema";
import { resetDatabase } from "../../helpers/db-helper";
import { request } from "../../helpers/request-helper";

describe("POST /api/todos - Create Todo", () => {
	const testUserId = "test-user-123";
	const db = getConnection(env);

	beforeEach(async () => {
		await resetDatabase();

		// Create a test user
		await db.insert(user).values({
			id: testUserId,
			email: "test@example.com",
			emailVerified: false,
			name: "Test User",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	});

	afterEach(async () => {
		await resetDatabase();
	});

	describe("successful creation", () => {
		it("should create a todo with title and description", async () => {
			const response = await request.post("/api/todos", {
				userId: testUserId,
				body: {
					title: "Buy groceries",
					description: "Milk, eggs, bread",
				},
			});

			expect(response.status).toBe(200);
			expect(response.data).toHaveProperty("todo");
			expect(response.data.todo).toMatchObject({
				title: "Buy groceries",
				description: "Milk, eggs, bread",
				completed: false,
				ownerId: testUserId,
			});
			expect(response.data.todo).toHaveProperty("id");

			// Verify in database
			const todos = await db
				.select()
				.from(todoTable)
				.where(eq(todoTable.id, response.data.todo.id));

			expect(todos).toHaveLength(1);
			expect(todos[0].title).toBe("Buy groceries");
		});

		it("should create a todo with only required fields", async () => {
			const response = await request.post("/api/todos", {
				userId: testUserId,
				body: {
					title: "Simple task",
				},
			});

			expect(response.status).toBe(200);
			expect(response.data.todo.description).toBeUndefined();
		});
	});

	describe("validation errors", () => {
		it("should return 400 when title is empty", async () => {
			const response = await request.post("/api/todos", {
				userId: testUserId,
				body: {
					title: "",
				},
			});

			expect(response.status).toBe(400);
			expect(response.data).toHaveProperty("error");
		});

		it("should return 400 when required field is missing", async () => {
			const response = await request.post("/api/todos", {
				userId: testUserId,
				body: {},
			});

			expect(response.status).toBe(400);
			expect(response.data).toHaveProperty("error");
		});
	});

	describe("authentication", () => {
		it("should return 401 when user is not authenticated", async () => {
			const response = await request.post("/api/todos", {
				body: {
					title: "Test Todo",
				},
			});

			expect(response.status).toBe(401);
			expect(response.data).toHaveProperty("error");
		});
	});

	describe("database persistence", () => {
		it("should persist data in database with all fields", async () => {
			const response = await request.post("/api/todos", {
				userId: testUserId,
				body: {
					title: "Persistent Todo",
					description: "This should be in DB",
				},
			});

			const todoId = response.data.todo.id;

			// Query directly from database
			const todos = await db
				.select()
				.from(todoTable)
				.where(eq(todoTable.id, todoId));

			expect(todos).toHaveLength(1);
			expect(todos[0]).toMatchObject({
				id: todoId,
				ownerId: testUserId,
				title: "Persistent Todo",
				description: "This should be in DB",
			});
		});
	});
});
```

### PATCH /api/{resource}/:id (Update)

```typescript
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { user } from "../../../src/infra/better-auth/auth-schema";
import { getConnection } from "../../../src/infra/drizzle/connection";
import { todoTable } from "../../../src/infra/drizzle/schema";
import { generateULID } from "../../../src/infra/drizzle/utils/generateULID";
import { resetDatabase } from "../../helpers/db-helper";
import { request } from "../../helpers/request-helper";

describe("PATCH /api/todos/:id - Update Todo", () => {
	const testUserId = "test-user-123";
	const otherUserId = "other-user-456";
	const db = getConnection(env);
	let todoId: string;

	beforeEach(async () => {
		await resetDatabase();

		// Create test users
		await db.insert(user).values([
			{
				id: testUserId,
				email: "test@example.com",
				emailVerified: false,
				name: "Test User",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: otherUserId,
				email: "other@example.com",
				emailVerified: false,
				name: "Other User",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		// Create a test todo
		const result = await db.insert(todoTable).values({
			id: generateULID(),
			ownerId: testUserId,
			title: "Original Title",
			description: "Original Description",
			completed: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		}).returning();

		todoId = result[0].id;
	});

	afterEach(async () => {
		await resetDatabase();
	});

	describe("successful update", () => {
		it("should update title", async () => {
			const response = await request.patch(`/api/todos/${todoId}`, {
				userId: testUserId,
				body: {
					title: "Updated Title",
				},
			});

			expect(response.status).toBe(200);
			expect(response.data.todo.title).toBe("Updated Title");
		});

		it("should update multiple fields", async () => {
			const response = await request.patch(`/api/todos/${todoId}`, {
				userId: testUserId,
				body: {
					title: "New Title",
					description: "New Description",
					completed: true,
				},
			});

			expect(response.status).toBe(200);
			expect(response.data.todo).toMatchObject({
				title: "New Title",
				description: "New Description",
				completed: true,
			});
		});

		it("should update only specified fields", async () => {
			const response = await request.patch(`/api/todos/${todoId}`, {
				userId: testUserId,
				body: {
					completed: true,
				},
			});

			expect(response.status).toBe(200);
			expect(response.data.todo.title).toBe("Original Title");
			expect(response.data.todo.completed).toBe(true);
		});
	});

	describe("validation errors", () => {
		it("should return 400 when title is too short", async () => {
			const response = await request.patch(`/api/todos/${todoId}`, {
				userId: testUserId,
				body: {
					title: "ab",
				},
			});

			expect(response.status).toBe(400);
			expect(response.data).toHaveProperty("error");
		});
	});

	describe("authorization", () => {
		it("should return 403 when user doesn't own the todo", async () => {
			const response = await request.patch(`/api/todos/${todoId}`, {
				userId: otherUserId,
				body: {
					title: "Hacked Title",
				},
			});

			expect(response.status).toBe(403);
			expect(response.data).toHaveProperty("error");
		});

		it("should return 401 when user is not authenticated", async () => {
			const response = await request.patch(`/api/todos/${todoId}`, {
				body: {
					title: "Updated Title",
				},
			});

			expect(response.status).toBe(401);
		});
	});

	describe("not found", () => {
		it("should return 404 when todo doesn't exist", async () => {
			const response = await request.patch("/api/todos/nonexistent-id", {
				userId: testUserId,
				body: {
					title: "Updated Title",
				},
			});

			expect(response.status).toBe(404);
			expect(response.data).toHaveProperty("error");
		});
	});
});
```

### GET /api/{resource} (List)

```typescript
import { env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { user } from "../../../src/infra/better-auth/auth-schema";
import { getConnection } from "../../../src/infra/drizzle/connection";
import { todoTable } from "../../../src/infra/drizzle/schema";
import { generateULID } from "../../../src/infra/drizzle/utils/generateULID";
import { resetDatabase } from "../../helpers/db-helper";
import { request } from "../../helpers/request-helper";

describe("GET /api/todos - List Todos", () => {
	const testUserId = "test-user-123";
	const otherUserId = "other-user-456";
	const db = getConnection(env);

	beforeEach(async () => {
		await resetDatabase();

		// Create test users
		await db.insert(user).values([
			{
				id: testUserId,
				email: "test@example.com",
				emailVerified: false,
				name: "Test User",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: otherUserId,
				email: "other@example.com",
				emailVerified: false,
				name: "Other User",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		// Create test todos
		await db.insert(todoTable).values([
			{
				id: generateULID(),
				ownerId: testUserId,
				title: "User 1 Todo 1",
				completed: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: generateULID(),
				ownerId: testUserId,
				title: "User 1 Todo 2",
				completed: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: generateULID(),
				ownerId: otherUserId,
				title: "User 2 Todo",
				completed: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	});

	afterEach(async () => {
		await resetDatabase();
	});

	it("should list all todos for authenticated user", async () => {
		const response = await request.get("/api/todos", {
			userId: testUserId,
		});

		expect(response.status).toBe(200);
		expect(response.data.todos).toHaveLength(2);
		expect(response.data.total).toBe(2);
	});

	it("should only return user's own todos", async () => {
		const response = await request.get("/api/todos", {
			userId: testUserId,
		});

		expect(response.status).toBe(200);
		expect(response.data.todos.every((t: any) => t.ownerId === testUserId)).toBe(true);
	});

	it("should return empty array when user has no todos", async () => {
		const newUserId = "new-user-789";
		await db.insert(user).values({
			id: newUserId,
			email: "new@example.com",
			emailVerified: false,
			name: "New User",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const response = await request.get("/api/todos", {
			userId: newUserId,
		});

		expect(response.status).toBe(200);
		expect(response.data.todos).toHaveLength(0);
		expect(response.data.total).toBe(0);
	});

	it("should return 401 when user is not authenticated", async () => {
		const response = await request.get("/api/todos");

		expect(response.status).toBe(401);
	});
});
```

### DELETE /api/{resource}/:id (Delete)

```typescript
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { user } from "../../../src/infra/better-auth/auth-schema";
import { getConnection } from "../../../src/infra/drizzle/connection";
import { todoTable } from "../../../src/infra/drizzle/schema";
import { generateULID } from "../../../src/infra/drizzle/utils/generateULID";
import { resetDatabase } from "../../helpers/db-helper";
import { request } from "../../helpers/request-helper";

describe("DELETE /api/todos/:id - Delete Todo", () => {
	const testUserId = "test-user-123";
	const otherUserId = "other-user-456";
	const db = getConnection(env);
	let todoId: string;

	beforeEach(async () => {
		await resetDatabase();

		// Create test users
		await db.insert(user).values([
			{
				id: testUserId,
				email: "test@example.com",
				emailVerified: false,
				name: "Test User",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: otherUserId,
				email: "other@example.com",
				emailVerified: false,
				name: "Other User",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		// Create a test todo
		const result = await db.insert(todoTable).values({
			id: generateULID(),
			ownerId: testUserId,
			title: "Test Todo",
			completed: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		}).returning();

		todoId = result[0].id;
	});

	afterEach(async () => {
		await resetDatabase();
	});

	it("should delete todo", async () => {
		const response = await request.delete(`/api/todos/${todoId}`, {
			userId: testUserId,
		});

		expect(response.status).toBe(200);
		expect(response.data.success).toBe(true);

		// Verify deletion in database
		const todos = await db
			.select()
			.from(todoTable)
			.where(eq(todoTable.id, todoId));

		expect(todos).toHaveLength(0);
	});

	it("should return 403 when user doesn't own the todo", async () => {
		const response = await request.delete(`/api/todos/${todoId}`, {
			userId: otherUserId,
		});

		expect(response.status).toBe(403);

		// Verify todo still exists
		const todos = await db
			.select()
			.from(todoTable)
			.where(eq(todoTable.id, todoId));

		expect(todos).toHaveLength(1);
	});

	it("should return 404 when todo doesn't exist", async () => {
		const response = await request.delete("/api/todos/nonexistent-id", {
			userId: testUserId,
		});

		expect(response.status).toBe(404);
	});

	it("should return 401 when user is not authenticated", async () => {
		const response = await request.delete(`/api/todos/${todoId}`);

		expect(response.status).toBe(401);
	});
});
```

## Test Helper Usage

### Request Helper

```typescript
import { request } from "../../helpers/request-helper";

// GET request
const response = await request.get("/api/todos", {
	userId: testUserId,
});

// POST request
const response = await request.post("/api/todos", {
	userId: testUserId,
	body: {
		title: "New Todo",
		description: "Description",
	},
});

// PATCH request
const response = await request.patch(`/api/todos/${todoId}`, {
	userId: testUserId,
	body: {
		title: "Updated Title",
	},
});

// DELETE request
const response = await request.delete(`/api/todos/${todoId}`, {
	userId: testUserId,
});

// Without authentication
const response = await request.get("/api/todos");
```

### Database Helper

```typescript
import { resetDatabase } from "../../helpers/db-helper";

beforeEach(async () => {
	await resetDatabase(); // Clears all tables
});

afterEach(async () => {
	await resetDatabase(); // Clean up after test
});
```

### Database Setup

```typescript
import { env } from "cloudflare:test";
import { getConnection } from "../../../src/infra/drizzle/connection";
import { user } from "../../../src/infra/better-auth/auth-schema";
import { todoTable } from "../../../src/infra/drizzle/schema";
import { generateULID } from "../../../src/infra/drizzle/utils/generateULID";

const db = getConnection(env);

// Create a user
await db.insert(user).values({
	id: testUserId,
	email: "test@example.com",
	emailVerified: false,
	name: "Test User",
	createdAt: new Date(),
	updatedAt: new Date(),
});

// Create a resource
await db.insert(todoTable).values({
	id: generateULID(),
	ownerId: testUserId,
	title: "Test Todo",
	completed: false,
	createdAt: new Date(),
	updatedAt: new Date(),
});
```

## Test Organization

### Test Suites

Organize tests into logical groups using nested `describe` blocks:

```typescript
describe("POST /api/todos - Create Todo", () => {
	describe("successful creation", () => {
		it("should create with all fields", async () => {});
		it("should create with required fields only", async () => {});
	});

	describe("validation errors", () => {
		it("should return 400 when field is invalid", async () => {});
	});

	describe("authentication", () => {
		it("should return 401 when not authenticated", async () => {});
	});

	describe("authorization", () => {
		it("should return 403 when not authorized", async () => {});
	});

	describe("database persistence", () => {
		it("should persist in database", async () => {});
	});
});
```

## Common Test Patterns

### Test Authentication

```typescript
it("should return 401 when user is not authenticated", async () => {
	const response = await request.post("/api/todos", {
		// No userId
		body: { title: "Test" },
	});

	expect(response.status).toBe(401);
	expect(response.data).toHaveProperty("error");
});
```

### Test Authorization

```typescript
it("should return 403 when user doesn't own the resource", async () => {
	const response = await request.patch(`/api/todos/${todoId}`, {
		userId: otherUserId, // Different user
		body: { title: "Hacked" },
	});

	expect(response.status).toBe(403);
});
```

### Test Validation

```typescript
it("should return 400 when field is invalid", async () => {
	const response = await request.post("/api/todos", {
		userId: testUserId,
		body: { title: "" }, // Invalid
	});

	expect(response.status).toBe(400);
	expect(response.data).toHaveProperty("error");
});
```

### Verify Database State

```typescript
// After create/update
const records = await db
	.select()
	.from(todoTable)
	.where(eq(todoTable.id, todoId));

expect(records).toHaveLength(1);
expect(records[0].title).toBe("Expected Title");
```

### Test Multiple Records

```typescript
it("should create multiple records for same user", async () => {
	await request.post("/api/todos", {
		userId: testUserId,
		body: { title: "First" },
	});

	await request.post("/api/todos", {
		userId: testUserId,
		body: { title: "Second" },
	});

	const todos = await db
		.select()
		.from(todoTable)
		.where(eq(todoTable.ownerId, testUserId));

	expect(todos).toHaveLength(2);
});
```

## Key Principles

1. **Isolation** - Each test is independent (use beforeEach/afterEach)
2. **Database Reset** - Always reset database before/after tests
3. **Test Data** - Create minimal test data needed for each test
4. **Descriptive Names** - Test names should clearly describe what they test
5. **Organized Suites** - Group related tests in describe blocks
6. **Verify Everything** - Test both response and database state
7. **Cover Edge Cases** - Test success, validation, auth, authorization, not found
8. **Use Helpers** - Use request and db helpers for consistency
