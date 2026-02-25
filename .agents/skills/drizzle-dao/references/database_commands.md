# Database Commands Reference

This document describes all database-related commands available in this project.

## Migration Commands

### Generate Migrations

```bash
bun run db:generate
```

**What it does:**
1. Applies any pending migrations to local D1 database (via `wrangler d1 migrations apply DB --local`)
2. Compares schema.ts with the current database state
3. Generates new migration SQL file in `drizzle/` directory

**When to run:**
- After adding a new table to `schema.ts`
- After modifying existing table columns
- After adding/removing relations

**Output:**
- New migration file: `drizzle/NNNN_random_name.sql`
- Meta files in `drizzle/meta/`

### Apply Migrations Manually

```bash
bun run db:migrate
```

**What it does:**
- Applies pending migrations to local D1 database
- Uses `.wrangler/state/v3/d1/*.sqlite` database

**When to run:**
- When setting up a fresh local environment
- To apply migrations without generating new ones

### Open Drizzle Studio

```bash
bun run db:studio
```

**What it does:**
- Opens Drizzle Studio (GUI database viewer) in browser
- Connects to local D1 database

**Use for:**
- Viewing table data during development
- Manual data inspection
- Testing queries visually

## Configuration Files

### drizzle.config.ts

Located at project root, configures Drizzle Kit:

```typescript
const development = process.env.ENVIRONMENT !== "production";

const commonConfig = {
	out: "./drizzle",
	schema: "./src/infra/drizzle/schema.ts",
	dialect: "sqlite",
} as const;

const devConfig = {
	dbCredentials: {
		url: getLocalD1DBPath(),
	},
};

const prodConfig = {
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	},
};
```

**Key points:**
- Development uses local SQLite file
- Production uses Cloudflare D1 HTTP API
- Schema path: `./src/infra/drizzle/schema.ts`
- Migrations output: `./drizzle`

### wrangler.jsonc

Database binding configuration:

```jsonc
{
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "api-template-db",
			"database_id": "bc7dae38-c516-479b-a8ae-18fa319314a9",
			"migrations_dir": "drizzle"
		}
	]
}
```

**Key points:**
- Binding name: `DB` (used in Worker code as `env.DB`)
- Migrations directory: `drizzle/`
- Database ID for Cloudflare D1

## Migration Workflow

### 1. Modify Schema

Edit `src/infra/drizzle/schema.ts`:

```typescript
export const newTable = sqliteTable("new_table", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	// ... other columns
});
```

### 2. Generate Migration

```bash
bun run db:generate
```

This creates:
- `drizzle/NNNN_description.sql` - Migration SQL
- `drizzle/meta/` - Metadata for migration tracking

### 3. Review Migration

Check the generated SQL file:

```sql
CREATE TABLE `new_table` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
```

### 4. Apply to Local Database

The migration is automatically applied during generation, but you can also run:

```bash
bun run db:migrate
```

### 5. Test Locally

```bash
bun run dev
```

Test your endpoints that use the new table.

### 6. Commit Migration

```bash
git add drizzle/
git commit -m "Add new_table migration"
```

### 7. Deploy

```bash
bun run deploy
```

This deploys the Worker and applies migrations to production D1.

## Local Database Location

The local D1 database is stored at:

```
.wrangler/state/v3/d1/*.sqlite
```

**Finding the exact path:**

```typescript
// src/infra/drizzle/utils/getLocalD1DbPath.ts
function getLocalD1DBPath() {
	const basePath = path.resolve(".wrangler/state/v3/d1");
	const dbFile = fs
		.readdirSync(basePath, { recursive: true })
		.find((f) => (f as string).endsWith(".sqlite"));
	return path.join(basePath, dbFile as string);
}
```

## Common Issues & Solutions

### "No pending migrations"

**Symptom:** `bun run db:generate` says no changes detected

**Solution:**
- Verify schema changes are saved in `schema.ts`
- Check schema is properly exported
- Ensure table names don't conflict

### "Migration already applied"

**Symptom:** Error when running migrations

**Solution:**
- Check `drizzle/meta/_journal.json` to see applied migrations
- Don't manually edit migration files after they're generated

### "Database locked"

**Symptom:** SQLite database lock error

**Solution:**
- Stop the dev server (`bun run dev`)
- Close Drizzle Studio
- Run the migration again

### "Table already exists"

**Symptom:** Migration fails with table exists error

**Solution:**
- Delete `.wrangler/state/` to reset local database
- Run `bun run db:migrate` to reapply all migrations

## Testing Migrations

### Integration Tests

Integration tests automatically apply migrations before running:

```typescript
// vitest.integration.config.mts
export default defineWorkersProject(async () => {
	const migrationsPath = path.join(__dirname, "drizzle");
	const migrations = await readD1Migrations(migrationsPath);

	return {
		test: {
			setupFiles: ["./test/setup/apply-migrations.ts"],
			poolOptions: {
				workers: {
					miniflare: {
						bindings: {
							TEST_MIGRATIONS: migrations,
						},
					},
				},
			},
		},
	};
});
```

### Manual Testing with Drizzle Studio

1. Run `bun run db:studio`
2. Navigate to the table in the UI
3. View/edit data manually
4. Test queries visually

## Environment Variables

For production database access:

```bash
# .env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_D1_TOKEN=your_api_token
```

These are used by `drizzle.config.ts` when `ENVIRONMENT !== "development"`

## Schema Change Examples

### Adding a Column

```typescript
export const todoTable = sqliteTable("todo", {
	// ... existing columns
	priority: integer("priority").default(0), // NEW
});
```

### Making a Column Required → Optional

```typescript
// Before
description: text("description").notNull(),

// After
description: text("description"),
```

### Adding a Foreign Key

```typescript
projectId: text("project_id")
	.notNull()
	.references(() => projectTable.id),
```

### Adding an Index

```typescript
import { index } from "drizzle-orm/sqlite-core";

export const todoTable = sqliteTable("todo", {
	// columns...
}, (table) => ({
	ownerIdIdx: index("todo_owner_id_idx").on(table.ownerId),
}));
```

### Adding Relations

```typescript
export const todoRelations = relations(todoTable, ({ one }) => ({
	project: one(projectTable, {
		fields: [todoTable.projectId],
		references: [projectTable.id],
	}),
}));
```

## Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `bun run db:generate` | Generate migrations from schema changes |
| `bun run db:migrate` | Apply pending migrations to local DB |
| `bun run db:studio` | Open Drizzle Studio GUI |
| `bun run dev` | Run local development server |
| `bun run deploy` | Deploy to Cloudflare Workers |
| `bun run test:integration` | Run integration tests with migrations |
