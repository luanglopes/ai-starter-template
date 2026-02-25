// import { env } from "cloudflare:test";
// import { getConnection } from "../../src/infra/drizzle/connection";
// import * as schema from "../../src/infra/drizzle/schema";

/**
 * Seed todos (static data)
 */
// export async function seedTodos(): Promise<void> {
// 	const testDb = getConnection(env);

// 	await testDb.insert(schema.todo).values([
// 		{
// 			id: "todo-1",
// 			owner_id: "user-123",
// 			title: "First seeded todo",
// 			description: "This is the first seeded todo item",
// 			completed: false,
// 		},
// 		{
// 			id: "todo-2",
// 			owner_id: "user-456",
// 			title: "Second seeded todo",
// 			description: "This is the second seeded todo item",
// 			completed: true,
// 		},
// 	]);
// }
