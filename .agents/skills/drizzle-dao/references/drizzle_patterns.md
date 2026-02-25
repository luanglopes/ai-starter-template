# Drizzle Patterns

This document contains reference examples of Drizzle ORM patterns used in this codebase.

## Schema Definition Pattern

Located in `src/infra/drizzle/schema.ts`

### Basic Table Definition

```typescript
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../better-auth/auth-schema";

export const todoTable = sqliteTable("todo", {
	id: text("id").primaryKey().notNull(),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id),
	title: text("title").notNull(),
	description: text("description"),
	completed: integer("completed", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.$default(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.$default(() => new Date()),
});
```

### Column Types for SQLite (D1)

- **Primary Key:** `text("id").primaryKey().notNull()`
- **Required Text:** `text("field_name").notNull()`
- **Optional Text:** `text("field_name")`
- **Boolean:** `integer("field_name", { mode: "boolean" }).notNull().default(false)`
- **Timestamp (auto-generated):** `integer("created_at", { mode: "timestamp_ms" }).notNull().$default(() => new Date())`
- **Foreign Key:** `text("owner_id").notNull().references(() => user.id)`

### Relations Definition

```typescript
export const todoRelations = relations(todoTable, ({ one }) => ({
	owner: one(user, {
		fields: [todoTable.ownerId],
		references: [user.id],
	}),
}));

// Add to parent table relations
export const userRelations = relations(user, ({ many }) => ({
	todos: many(todoTable),
}));
```

## DAO Implementation Pattern

Located in `src/infra/drizzle/dao/Drizzle{Entity}DAO.ts`

### Complete DAO Implementation Example

```typescript
import { count, eq } from "drizzle-orm";
import type {
	CreateTodoParams,
	ListTodosByOwnerIdParams,
	TodoDAO,
	UpdateTodoParams,
} from "../../../app/dao/TodoDAO";
import type { Todo } from "../../../app/domain/Todo";
import type { Connection } from "../connection";
import { todoTable } from "../schema";
import { generateULID } from "../utils/generateULID";

export class DrizzleTodoDAO implements TodoDAO {
	constructor(private db: Connection) {}

	async getById(id: string): Promise<Todo | null> {
		const result = await this.db
			.select()
			.from(todoTable)
			.where(eq(todoTable.id, id));
		return result.length > 0 ? this.mapToEntity(result[0]) : null;
	}

	async findByOwnerId(
		params: ListTodosByOwnerIdParams,
	): Promise<{ result: Todo[]; total: number }> {
		const query = this.db
			.select()
			.from(todoTable)
			.where(eq(todoTable.ownerId, params.ownerId))
			.limit(params.limit)
			.offset(params.offset);
		const countQuery = this.db
			.select({ count: count(todoTable.id) })
			.from(todoTable)
			.where(eq(todoTable.ownerId, params.ownerId));
		const [results, countResult] = await Promise.all([query, countQuery]);
		const total = countResult[0]?.count ?? 0;
		return { result: results.map((row) => this.mapToEntity(row)), total };
	}

	async create(todo: CreateTodoParams): Promise<Todo> {
		const result = await this.db
			.insert(todoTable)
			.values({
				id: generateULID(),
				...todo,
			})
			.returning();
		return this.mapToEntity(result[0]);
	}

	async update({ id, ...params }: UpdateTodoParams): Promise<Todo> {
		const result = await this.db
			.update(todoTable)
			.set(params)
			.where(eq(todoTable.id, id))
			.returning();
		return this.mapToEntity(result[0]);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(todoTable).where(eq(todoTable.id, id));
	}

	private mapToEntity(row: typeof todoTable.$inferSelect): Todo {
		return {
			id: row.id,
			ownerId: row.ownerId,
			title: row.title,
			description: row.description ?? undefined,
			completed: row.completed,
		};
	}
}
```

## Key DAO Patterns

### 1. Constructor Injection

```typescript
export class DrizzleEntityDAO implements EntityDAO {
	constructor(private db: Connection) {}
}
```

### 2. GetById Pattern

```typescript
async getById(id: string): Promise<Entity | null> {
	const result = await this.db
		.select()
		.from(entityTable)
		.where(eq(entityTable.id, id));
	return result.length > 0 ? this.mapToEntity(result[0]) : null;
}
```

### 3. FindBy Pattern (with pagination)

```typescript
async findByOwnerId(
	params: ListEntitiesByOwnerIdParams,
): Promise<{ result: Entity[]; total: number }> {
	const query = this.db
		.select()
		.from(entityTable)
		.where(eq(entityTable.ownerId, params.ownerId))
		.limit(params.limit)
		.offset(params.offset);

	const countQuery = this.db
		.select({ count: count(entityTable.id) })
		.from(entityTable)
		.where(eq(entityTable.ownerId, params.ownerId));

	const [results, countResult] = await Promise.all([query, countQuery]);
	const total = countResult[0]?.count ?? 0;

	return {
		result: results.map((row) => this.mapToEntity(row)),
		total
	};
}
```

### 4. Create Pattern (with ULID)

```typescript
async create(entity: CreateEntityParams): Promise<Entity> {
	const result = await this.db
		.insert(entityTable)
		.values({
			id: generateULID(),
			...entity,
		})
		.returning();
	return this.mapToEntity(result[0]);
}
```

### 5. Update Pattern

```typescript
async update({ id, ...params }: UpdateEntityParams): Promise<Entity> {
	const result = await this.db
		.update(entityTable)
		.set(params)
		.where(eq(entityTable.id, id))
		.returning();
	return this.mapToEntity(result[0]);
}
```

### 6. Delete Pattern

```typescript
async delete(id: string): Promise<void> {
	await this.db.delete(entityTable).where(eq(entityTable.id, id));
}
```

### 7. mapToEntity Pattern

```typescript
private mapToEntity(row: typeof entityTable.$inferSelect): Entity {
	return {
		id: row.id,
		ownerId: row.ownerId,
		title: row.title,
		description: row.description ?? undefined, // Convert null to undefined
		completed: row.completed,
		// Don't include createdAt/updatedAt in domain model unless needed
	};
}
```

## Common Drizzle Operators

```typescript
import { count, eq, and, or, like, gte, lte } from "drizzle-orm";

// Equality
.where(eq(table.field, value))

// Multiple conditions (AND)
.where(and(
	eq(table.field1, value1),
	eq(table.field2, value2)
))

// Multiple conditions (OR)
.where(or(
	eq(table.field1, value1),
	eq(table.field2, value2)
))

// Like (partial match)
.where(like(table.field, "%search%"))

// Greater than or equal
.where(gte(table.field, value))

// Less than or equal
.where(lte(table.field, value))

// Count
.select({ count: count(table.id) })

// Order by
.orderBy(table.createdAt)

// Pagination
.limit(params.limit)
.offset(params.offset)
```

## Factory Pattern

Located in `src/infra/factories/DAOFactory.ts`

```typescript
import type { TodoDAO } from "../../app/dao/TodoDAO";
import type { Connection } from "../drizzle/connection";
import { DrizzleTodoDAO } from "../drizzle/dao/DrizzleTodoDAO";
import { ServiceLocator } from "../ServiceLocator";

export function getTodoDAO(db: Connection): TodoDAO {
	const mock = ServiceLocator.get("todoDAO");
	if (mock) return mock;
	return new DrizzleTodoDAO(db);
}
```

**Pattern:**
1. Check ServiceLocator for mock (used in tests)
2. If no mock, instantiate the real implementation
3. Pass the Connection from parameter

## Schema Export Pattern

All tables must be exported from `schema.ts` to be included in the Drizzle schema:

```typescript
export const myNewTable = sqliteTable("my_new", {
	// columns...
});

export const myNewRelations = relations(myNewTable, ({ one, many }) => ({
	// relations...
}));
```

## Migration Commands

After schema changes, generate migrations:

```bash
bun run db:generate
```

This command:
1. Runs `wrangler d1 migrations apply DB --local` (applies pending migrations)
2. Runs `drizzle-kit generate` (generates new migration from schema changes)

The generated migration will be in `drizzle/NNNN_description.sql`

## Key Principles

1. **Type Safety:** Use `typeof table.$inferSelect` for database row types
2. **ULID Generation:** Always use `generateULID()` for IDs
3. **Null to Undefined:** Convert database `null` to `undefined` in mapToEntity for optional fields
4. **No Timestamps in Domain:** Don't include createdAt/updatedAt in domain models unless business logic needs them
5. **Implement Interface:** Always implement the interface from `src/app/dao/`
6. **Connection Injection:** Inject `Connection` via constructor
7. **Returning:** Use `.returning()` for insert/update to get the full row back
8. **Pagination:** Always run count query in parallel with data query for performance
