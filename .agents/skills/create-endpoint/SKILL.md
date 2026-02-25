---
name: create-endpoint
description: Create HTTP endpoints, controllers, and integration tests for Hono API with Valibot validation. Use when the user asks to create or update an endpoint, API route, controller, or HTTP handler. This skill focuses ONLY on the interfaces/http layer (controllers, router registration) and test/integration (integration tests). Assumes the use case already exists in src/app/usecases. Triggers include requests like "create an endpoint for...", "add a route for...", "create a controller for...", "expose the use case via API", or any HTTP layer work.
---

# Create Endpoint & Integration Tests

Create HTTP controllers, register routes, and write integration tests for Hono-based API endpoints with Valibot validation. This skill handles only the HTTP interface layer (`src/interfaces/http/`) and integration tests (`test/integration/`), assuming the use case already exists.

Resolve the API package root first (for example `code/api` or `api`) and run all file checks/commands there. Paths below are relative to that package root.

## Workflow

### 1. Understand Requirements

Ask the user to clarify:

- What use case should be exposed via HTTP?
- What HTTP method (GET, POST, PATCH, DELETE)?
- What is the endpoint path (e.g., `/todos`, `/todos/:id`)?
- What are the input parameters (body, path params, query params)?
- What validation rules apply?
- Does it require authentication?

### 2. Verify Use Case Exists

**Check the use case:**

```bash
ls src/app/usecases/
```

Confirm that the use case class and types exist in `src/app/usecases/{UseCaseName}/`.

**If use case doesn't exist:**
⚠️ Inform the user they need to create the use case first (use the create-usecase skill).

### 3. Determine HTTP Method and Path

Based on the operation:

- **Create resource:** POST `/resource`
- **List resources:** GET `/resource`
- **Get single resource:** GET `/resource/:id`
- **Update resource:** PATCH `/resource/:id`
- **Delete resource:** DELETE `/resource/:id`

### 4. Create Controller

Create `src/interfaces/http/controllers/{UseCaseName}.ts`:

**Structure:**

```typescript
import * as v from "valibot";
import type { UseCaseNameUseCase } from "../../../app/usecases/UseCaseName";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class UseCaseNameController {
	static readonly path = "/resource"; // or "/resource/:id"
	static readonly schema = {
		// Add validation schemas here
		json: v.object({
			// JSON body fields
		}),
		param: v.object({
			// Path parameters
		}),
	};

	constructor(private useCaseNameUseCase: UseCaseNameUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);

			// Get validated inputs
			const payload = ctx.req.valid("json"); // If has JSON body
			const { id } = ctx.req.valid("param"); // If has path params

			// Execute use case
			const result = await this.useCaseNameUseCase.execute({
				ownerId: session.user.id,
				// Map inputs to use case params
			});

			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof UseCaseNameController.path,
	typeof UseCaseNameController.schema
>;
```

**Key components:**

1. Static `path` - The route path string
2. Static `schema` - Valibot validation schemas (json, param, query)
3. Constructor - Receives use case instance
4. `handle` method - Processes request and returns response
5. `ReqContext` type - Type-safe context with path and schema types

See [controller_patterns.md](references/controller_patterns.md) for complete examples.

### 5. Define Validation Schema

Use Valibot for input validation:

**Common patterns:**

```typescript
static readonly schema = {
	// JSON body validation
	json: v.object({
		title: v.pipe(v.string(), v.trim(), v.minLength(3)),
		description: v.optional(v.string()),
		completed: v.optional(v.boolean()),
	}),

	// Path parameter validation
	param: v.object({
		id: v.string(),
	}),

	// Query parameter validation
	query: v.object({
		limit: v.optional(v.pipe(v.string(), v.transform(Number))),
		offset: v.optional(v.pipe(v.string(), v.transform(Number))),
	}),
};
```

**No validation needed:**

```typescript
static readonly schema = {};
```

See [controller_patterns.md](references/controller_patterns.md) for validation patterns.

### 6. Register Route

Edit `src/interfaces/http/router.ts`:

**Import controller and use case:**

```typescript
import { UseCaseName } from "../../app/usecases/UseCaseName";
import { UseCaseNameController } from "./controllers/UseCaseName";
```

**Import DAOs/factories if needed:**

```typescript
import { getEntityDAO } from "../../infra/factories/DAOFactory";
```

**Add route to router:**

```typescript
export const apiRouter = new Hono<AppEnv>()
	// ... existing routes
	.post(
		// or .get, .patch, .delete
		UseCaseNameController.path,
		sValidator("json", UseCaseNameController.schema.json), // If has JSON
		sValidator("param", UseCaseNameController.schema.param), // If has params
		(c) => {
			const db = getConnection(c.env);
			const entityDAO = getEntityDAO(db);
			// ... get other dependencies
			const useCase = new UseCaseName(entityDAO);
			return new UseCaseNameController(useCase).handle(c);
		},
	);
```

**Router patterns:**

**No validation:**

```typescript
.get(ControllerName.path, (c) => {
	const db = getConnection(c.env);
	const dao = getDAO(db);
	const useCase = new UseCase(dao);
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
	},
)
```

### 7. Create Integration Tests

Create `test/integration/{resource}/{operation}.test.ts`:

**File naming:**

- Create: `create.test.ts`
- List: `list.test.ts`
- Get: `get.test.ts`
- Update: `update.test.ts`
- Delete: `delete.test.ts`

**Test structure:**

```typescript
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { user } from "../../../src/infra/better-auth/auth-schema";
import { getConnection } from "../../../src/infra/drizzle/connection";
import { entityTable } from "../../../src/infra/drizzle/schema";
import { resetDatabase } from "../../helpers/db-helper";
import { request } from "../../helpers/request-helper";

describe("HTTP_METHOD /api/path - Description", () => {
	const testUserId = "test-user-123";
	const db = getConnection(env);

	beforeEach(async () => {
		await resetDatabase();

		// Create test user
		await db.insert(user).values({
			id: testUserId,
			email: "test@example.com",
			emailVerified: false,
			name: "Test User",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Create test data if needed
	});

	afterEach(async () => {
		await resetDatabase();
	});

	describe("successful operation", () => {
		it("should perform the operation", async () => {
			const response = await request.post("/api/resource", {
				userId: testUserId,
				body: {
					// request body
				},
			});

			expect(response.status).toBe(200);
			expect(response.data).toHaveProperty("expectedField");
		});
	});

	describe("validation errors", () => {
		it("should return 400 when field is invalid", async () => {
			const response = await request.post("/api/resource", {
				userId: testUserId,
				body: {
					invalidField: "",
				},
			});

			expect(response.status).toBe(400);
			expect(response.data).toHaveProperty("error");
		});
	});

	describe("authentication", () => {
		it("should return 401 when user is not authenticated", async () => {
			const response = await request.post("/api/resource", {
				body: {},
			});

			expect(response.status).toBe(401);
		});
	});

	describe("database persistence", () => {
		it("should persist data in database", async () => {
			const response = await request.post("/api/resource", {
				userId: testUserId,
				body: { field: "value" },
			});

			// Verify in database
			const records = await db
				.select()
				.from(entityTable)
				.where(eq(entityTable.id, response.data.entity.id));

			expect(records).toHaveLength(1);
		});
	});
});
```

**Test organization:**

- **successful operation** - Happy path tests
- **validation errors** - Test all validation rules
- **authentication** - Test 401 when not authenticated
- **authorization** - Test 403 when not authorized (if applicable)
- **not found** - Test 404 for GET/PATCH/DELETE (if applicable)
- **database persistence** - Verify data is correctly saved/updated/deleted

See [integration_test_patterns.md](references/integration_test_patterns.md) for complete examples.

### 8. Run Tests

Run integration tests:

```bash
bun run test:integration
```

Verify:

- All tests pass
- Authentication is working (401 when no userId)
- Validation is working (400 for invalid inputs)
- Database operations are correct
- Authorization is enforced (403 when not owner)

### 9. Test Manually

Start dev server:

```bash
bun run dev
```

Test endpoint manually:

```bash
# Create (example)
curl -X POST http://localhost:8787/api/todos \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-123" \
  -d '{"title":"Test Todo","description":"Description"}'
```

### 10. Inform About Next Steps

After completing the endpoint work, inform the user:

✅ **Completed:**

- Created controller in `src/interfaces/http/controllers/`
- Registered route in `router.ts`
- Created integration tests in `test/integration/`
- All tests passing

⚠️ **Next steps:**

- Test manually with `bun run dev`
- Document API in README or OpenAPI spec (if needed)
- Deploy with `bun run deploy`

## Common Patterns

Use the reference files for complete controller and integration-test examples by HTTP method. Keep this SKILL focused on workflow and decision points; load examples only as needed.

## Reference Files

- **[controller_patterns.md](references/controller_patterns.md)** - Complete controller examples for all HTTP methods with validation patterns and router registration
- **[integration_test_patterns.md](references/integration_test_patterns.md)** - Complete integration test examples with all test categories and database setup

## Key Principles

1. **Static Properties** - path and schema must be static readonly
2. **Type Safety** - Use AppContext with path and schema types
3. **Authentication** - Always call getSession(ctx)
4. **Validation** - Use Valibot schemas in static schema property
5. **Error Handling** - Always use try/catch with createErrorResponse
6. **Response Format** - Use createJsonResponse for all responses
7. **Test Coverage** - Test success, validation, auth, authorization, persistence
8. **Database Cleanup** - Always reset database in beforeEach/afterEach
