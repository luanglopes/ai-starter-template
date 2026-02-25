---
name: create-usecase
description: Generate use cases following the clean architecture pattern used in this API template. Use when the user asks to create, add, or implement a new use case, business logic, feature logic, or domain operation. This skill focuses ONLY on the app layer (domain, dao, providers, usecases) and does NOT handle controllers, HTTP routes, or infrastructure implementations. Triggers include requests like "create a use case for...", "add business logic to...", "implement a feature for...", or "create a new operation for..."
---

# Create Use Case

Generate use cases following the clean architecture patterns in this codebase. This skill handles only the application layer (`src/app/`) including domain models, DAOs, providers, and use case implementations.

Resolve the API package root first (for example `code/api` or `api`) and run all file checks/commands there. Paths below are relative to that package root.

## Workflow

### 1. Understand the Requirements

Ask the user to clarify:
- What business operation does this use case perform?
- What are the inputs (parameters)?
- What are the outputs (return values)?
- Are there any validation rules?
- Are there authorization requirements (e.g., ownership checks)?
- Does it need pagination, filtering, or sorting?

### 2. Check Available Resources

Before creating new files, check existing resources in `src/app/`:

**Check domain models:**
```bash
ls src/app/domain/
```

**Check DAOs:**
```bash
ls src/app/dao/
```

**Check providers:**
```bash
ls src/app/providers/
```

See [available_resources.md](references/available_resources.md) for currently available DAOs, domain models, providers, and errors.

### 3. Determine What to Create or Update

Based on the requirements and existing resources:

**If using an existing domain model:**
- ✅ Reuse it directly
- ❌ Do not modify unless user explicitly requests changes

**If a new domain model is needed:**
- Create `src/app/domain/{EntityName}.ts`
- Keep it simple - just the type definition

**If using an existing DAO:**
- ✅ Reuse it directly
- ⚠️ If new methods are needed, inform the user they'll need to extend the DAO interface and implementation (outside this skill's scope)

**If a new DAO is needed:**
- Create the interface in `src/app/dao/{EntityName}DAO.ts`
- ⚠️ Inform the user they'll need to implement it in `src/infra/drizzle/dao/` (outside this skill's scope)

**If using an existing provider:**
- ✅ Reuse it directly (e.g., AIProvider)
- ⚠️ If new methods are needed, inform the user they'll need to extend the provider interface and implementation (outside this skill's scope)

**If a new provider is needed:**
- Create the interface in `src/app/providers/{ProviderName}Provider.ts`
- ⚠️ Inform the user they'll need to implement it in `src/infra/` (outside this skill's scope)

### 4. Create the Use Case Files

Create the use case directory structure:

```
src/app/usecases/{UseCaseName}/
├── {UseCaseName}.ts      # Main implementation
├── {UseCaseName}.spec.ts # Unit tests
├── types.ts              # Type definitions
└── index.ts              # Named exports
```

**File creation order:**
1. `types.ts` - Define input/output types and use case interface
2. `{UseCaseName}.ts` - Implement the use case class
3. `index.ts` - Export the class and types
4. `{UseCaseName}.spec.ts` - Write comprehensive unit tests

### 5. Write the Implementation

**types.ts pattern:**
```typescript
import type { DomainModel } from "../../domain/DomainModel";

export interface UseCaseNameUseCase {
	execute(params: UseCaseNameInput): Promise<UseCaseNameOutput>;
}

export type UseCaseNameInput = {
	// Input parameters
	ownerId: string;
	// ... other required fields
	// ... optional fields with ?
};

export type UseCaseNameOutput = {
	// Output fields
	entity: DomainModel;
};
```

**{UseCaseName}.ts pattern:**
```typescript
import type { EntityDAO } from "../../dao/EntityDAO";
import { ValidationError, NotFoundError, UnauthorizedError } from "../../domain/errors";
import type {
	UseCaseNameInput,
	UseCaseNameOutput,
	UseCaseNameUseCase,
} from "./types";

export class UseCaseName implements UseCaseNameUseCase {
	constructor(
		private entityDAO: EntityDAO,
		// Add other dependencies (DAOs, providers)
	) {}

	async execute(params: UseCaseNameInput): Promise<UseCaseNameOutput> {
		// 1. Extract and validate input
		// 2. Check authorization if needed
		// 3. Perform business logic
		// 4. Call DAO methods
		// 5. Return output
	}
}
```

**index.ts pattern:**
```typescript
export * from "./UseCaseName";
export * from "./types";
```

### 6. Write Comprehensive Tests

Create `{UseCaseName}.spec.ts` with:

1. **Setup:** Mock all dependencies (DAOs, providers)
2. **Validation tests:** Test each validation rule
3. **Authorization tests:** Test ownership/permission checks
4. **Success tests:** Test happy paths
5. **Edge cases:** Test boundary conditions

See [usecase_patterns.md](references/usecase_patterns.md) for detailed testing patterns.

### 7. Inform About Next Steps

After creating the use case, inform the user:

✅ **Completed:**
- Created use case in `src/app/usecases/{UseCaseName}/`
- Implemented business logic with validation
- Added comprehensive unit tests

⚠️ **Next steps (outside this skill):**
- If new DAO was created: Implement it in `src/infra/drizzle/dao/`
- If new provider was created: Implement it in `src/infra/`
- Create HTTP controller in `src/interfaces/http/controllers/`
- Add route to `src/interfaces/http/router.ts`
- Create integration tests in `test/integration/`

## Common Patterns

### Validation Pattern
```typescript
if (title !== undefined) {
	const trimmedTitle = title.trim();

	if (trimmedTitle.length === 0) {
		throw new ValidationError("Title should not be empty");
	}

	if (trimmedTitle.length < 3) {
		throw new ValidationError("Title should have at least 3 characters");
	}
}
```

### Authorization Pattern
```typescript
const existingEntity = await this.entityDAO.getById(id);

if (!existingEntity) {
	throw new NotFoundError("Entity not found");
}

if (existingEntity.ownerId !== ownerId) {
	throw new UnauthorizedError("You can only modify your own entities");
}
```

### Pagination Pattern
```typescript
const { ownerId, limit = 100, offset = 0 } = params;

const { result: entities, total } = await this.entityDAO.findByOwnerId({
	ownerId,
	limit,
	offset,
});

return { entities, total };
```

## Reference Files

- **[usecase_patterns.md](references/usecase_patterns.md)** - Complete examples of CreateTodo, UpdateTodo, ListTodos with full implementation and tests
- **[available_resources.md](references/available_resources.md)** - Current DAOs, domain models, providers, and errors available for reuse

## Key Principles

1. **Single Responsibility** - One use case = one business operation
2. **Dependency Injection** - All dependencies via constructor
3. **Domain Errors** - Use domain errors (`ValidationError`, `NotFoundError`, etc.) not generic errors
4. **Type Safety** - Strong typing for all inputs and outputs
5. **Testability** - Mock all dependencies in tests
6. **Validation First** - Validate inputs before database operations
7. **Authorization Checks** - Verify permissions before mutations
