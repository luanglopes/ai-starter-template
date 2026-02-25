---
name: drizzle-dao
description: Handle database schema changes, Drizzle DAO implementations, and migrations for Cloudflare D1 with Drizzle ORM. Use when the user asks to create database tables, implement DAOs, modify schema, generate migrations, or work with database infrastructure. This skill focuses ONLY on the infra/drizzle layer (schema, DAO implementations, migrations) and references app/dao for interface definitions. Triggers include requests like "add a database table for...", "implement the DAO for...", "create schema for...", "generate migrations", "add a column to...", or any database infrastructure work.
---

# Drizzle DAO & Schema Management

Handle database schema definition, DAO implementations, and migration generation for Cloudflare D1 using Drizzle ORM. This skill manages only the infrastructure layer (`src/infra/drizzle/`) and follows interfaces defined in `src/app/dao/`.

Resolve the API package root first (for example `code/api` or `api`) and run all file checks/commands there. Paths below are relative to that package root.

## Workflow

### 1. Understand Requirements

Ask the user to clarify:
- What entity/table needs database persistence?
- What fields does it have (name, type, required/optional)?
- Are there foreign key relationships?
- Does a DAO interface already exist in `src/app/dao/`?
- Is this a new table or modification to existing table?

### 2. Check Existing Resources

**Check existing tables:**
```bash
cat src/infra/drizzle/schema.ts
```

**Check existing DAO interfaces:**
```bash
ls src/app/dao/
```

**Check existing DAO implementations:**
```bash
ls src/infra/drizzle/dao/
```

### 3. Determine Work Scope

Based on requirements:

**For a new table:**
- ✅ Add table definition to `schema.ts`
- ✅ Add relations if needed
- ✅ Create DAO implementation in `dao/`
- ✅ Add factory function in `factories/DAOFactory.ts`
- ✅ Generate migration
- ⚠️ User must have created DAO interface in `src/app/dao/` first

**For modifying existing table:**
- ✅ Update table definition in `schema.ts`
- ✅ Update DAO implementation if methods change
- ✅ Generate migration
- ⚠️ Warn about destructive changes (dropping columns, changing types)

**For a new DAO implementation (interface already exists):**
- ✅ Create `Drizzle{Entity}DAO.ts` in `dao/`
- ✅ Implement all interface methods
- ✅ Add factory function

### 4. Define/Update Schema

Edit `src/infra/drizzle/schema.ts`:

**Table naming convention:**
- Table constant: `{entity}Table` (camelCase)
- SQL table name: `{entity}` (lowercase, snake_case for multi-word)
- Example: `todoTable` → `"todo"`

**Required columns for all tables:**
- `id: text("id").primaryKey().notNull()`
- Consider: `createdAt`, `updatedAt` for audit trail

**Column pattern:**
```typescript
export const entityTable = sqliteTable("entity", {
	id: text("id").primaryKey().notNull(),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id),
	name: text("name").notNull(),
	description: text("description"), // optional
	completed: integer("completed", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.$default(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.$default(() => new Date()),
});
```

**Add relations if needed:**
```typescript
export const entityRelations = relations(entityTable, ({ one, many }) => ({
	owner: one(user, {
		fields: [entityTable.ownerId],
		references: [user.id],
	}),
}));
```

See [drizzle_patterns.md](references/drizzle_patterns.md) for column types and patterns.

### 5. Implement DAO

Create `src/infra/drizzle/dao/Drizzle{Entity}DAO.ts`:

**Structure:**
```typescript
import { count, eq } from "drizzle-orm";
import type { CreateEntityParams, EntityDAO, UpdateEntityParams } from "../../../app/dao/EntityDAO";
import type { Entity } from "../../../app/domain/Entity";
import type { Connection } from "../connection";
import { entityTable } from "../schema";
import { generateULID } from "../utils/generateULID";

export class DrizzleEntityDAO implements EntityDAO {
	constructor(private db: Connection) {}

	async getById(id: string): Promise<Entity | null> {
		const result = await this.db
			.select()
			.from(entityTable)
			.where(eq(entityTable.id, id));
		return result.length > 0 ? this.mapToEntity(result[0]) : null;
	}

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

	async update({ id, ...params }: UpdateEntityParams): Promise<Entity> {
		const result = await this.db
			.update(entityTable)
			.set(params)
			.where(eq(entityTable.id, id))
			.returning();
		return this.mapToEntity(result[0]);
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(entityTable).where(eq(entityTable.id, id));
	}

	private mapToEntity(row: typeof entityTable.$inferSelect): Entity {
		return {
			id: row.id,
			ownerId: row.ownerId,
			name: row.name,
			description: row.description ?? undefined, // null → undefined
			completed: row.completed,
		};
	}
}
```

**Key patterns:**
1. Inject `Connection` via constructor
2. Use `generateULID()` for IDs
3. Always use `.returning()` on insert/update
4. Map database rows to domain models in `mapToEntity`
5. Convert `null` to `undefined` for optional fields

See [drizzle_patterns.md](references/drizzle_patterns.md) for complete examples.

### 6. Add Factory Function

Edit `src/infra/factories/DAOFactory.ts`:

```typescript
import type { EntityDAO } from "../../app/dao/EntityDAO";
import { DrizzleEntityDAO } from "../drizzle/dao/DrizzleEntityDAO";

export function getEntityDAO(db: Connection): EntityDAO {
	const mock = ServiceLocator.get("entityDAO");
	if (mock) return mock;
	return new DrizzleEntityDAO(db);
}
```

**Don't forget to:**
- Import the DAO class
- Import the DAO interface type
- Check ServiceLocator for mocks (test support)

### 7. Generate Migration

After schema changes are complete:

```bash
bun run db:generate
```

**This command:**
1. Applies pending migrations to local D1
2. Compares schema.ts with database
3. Generates new migration SQL in `drizzle/`

**Review the generated migration:**
```bash
cat drizzle/NNNN_*.sql
```

Verify:
- Table names are correct
- Column types are correct
- Foreign keys are proper
- No unexpected changes

### 8. Test Locally

Start dev server:
```bash
bun run dev
```

Test using:
- Drizzle Studio: `bun run db:studio`
- Integration tests: `bun run test:integration`
- Manual API calls

### 9. Inform About Next Steps

After completing the database work, inform the user:

✅ **Completed:**
- Added/updated table definition in `schema.ts`
- Implemented DAO in `src/infra/drizzle/dao/`
- Added factory function in `DAOFactory.ts`
- Generated migration in `drizzle/`

⚠️ **Next steps:**
- Review generated migration SQL
- Test with `bun run dev` and `bun run db:studio`
- Commit migration files (`drizzle/` directory)
- Deploy with `bun run deploy`

## Common Patterns

### Pagination Pattern

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

### Foreign Key Pattern

```typescript
export const todoTable = sqliteTable("todo", {
	// ...
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id),
});

export const todoRelations = relations(todoTable, ({ one }) => ({
	owner: one(user, {
		fields: [todoTable.ownerId],
		references: [user.id],
	}),
}));
```

### Timestamp Pattern

```typescript
createdAt: integer("created_at", { mode: "timestamp_ms" })
	.notNull()
	.$default(() => new Date()),
updatedAt: integer("updated_at", { mode: "timestamp_ms" })
	.notNull()
	.$default(() => new Date()),
```

### Boolean Pattern

```typescript
completed: integer("completed", { mode: "boolean" }).notNull().default(false),
```

## Database Commands

See [database_commands.md](references/database_commands.md) for complete command reference.

**Quick reference:**
- `bun run db:generate` - Generate migrations from schema changes
- `bun run db:migrate` - Apply pending migrations
- `bun run db:studio` - Open database GUI
- `bun run dev` - Run local development server
- `bun run test:integration` - Run integration tests

## Common Issues

### "No pending migrations"

Schema changes not detected by Drizzle Kit.

**Solution:** Verify schema changes are saved and properly exported.

### "Table already exists"

Migration tries to create existing table.

**Solution:** Delete `.wrangler/state/` and run `bun run db:migrate`.

### "Database locked"

SQLite lock error.

**Solution:** Stop dev server and Drizzle Studio, then retry.

## Reference Files

- **[drizzle_patterns.md](references/drizzle_patterns.md)** - Complete schema and DAO implementation examples with all patterns
- **[database_commands.md](references/database_commands.md)** - All database commands, migration workflow, and troubleshooting

## Key Principles

1. **Follow Interfaces** - Always implement the interface from `src/app/dao/`
2. **Type Safety** - Use `typeof table.$inferSelect` for row types
3. **ULID for IDs** - Use `generateULID()` for primary keys
4. **Null Handling** - Convert database `null` to `undefined` in mapToEntity
5. **Returning** - Always use `.returning()` on insert/update
6. **Parallel Queries** - Run count and data queries in parallel for pagination
7. **Export Tables** - Export all tables from `schema.ts` for Drizzle to detect
8. **Review Migrations** - Always review generated SQL before committing
