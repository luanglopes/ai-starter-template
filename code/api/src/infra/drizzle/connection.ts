import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function getConnection(env: Env) {
	const client = postgres(env.DATABASE_URL);
	return drizzle(client, { schema });
}

export type Connection = ReturnType<typeof getConnection>;
