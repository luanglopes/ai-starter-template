import { env } from "cloudflare:test";
import * as authSchema from "../../src/infra/better-auth/auth-schema";
import { getConnection } from "../../src/infra/drizzle/connection";
import * as schema from "../../src/infra/drizzle/schema";

export async function resetDatabase() {
	const db = getConnection(env);

	const deletionOrder = [
		schema.todosTable,
		schema.aiCallLogs,
		authSchema.session,
		authSchema.account,
		authSchema.verification,
		authSchema.user,
	];

	for (const table of deletionOrder) {
		try {
			await db.delete(table);
		} catch (_error) {
			// Ignore cleanup errors from missing tables
		}
	}
}
