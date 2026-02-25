import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { getConnection } from "../../src/infra/drizzle/connection";
import * as schema from "../../src/infra/drizzle/schema";
import { requestHelper } from "../helpers/request-helper";

const USER_ID = "user-todos-test";

beforeEach(async () => {
	const db = getConnection(env);
	await db.insert(schema.user).values({
		id: USER_ID,
		email: "todos-test@example.com",
		name: "Todos Tester",
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
});

describe("Todos API", () => {
	it("creates and lists todos for authenticated user", async () => {
		const created = await requestHelper.post(
			"/api/todos",
			{ title: "Buy milk", description: "2 liters" },
			{ headers: { "X-User-Id": USER_ID } },
		);

		expect(created.status).toBe(201);
		expect(created.data.todo.title).toBe("Buy milk");

		const listed = await requestHelper.get("/api/todos", {
			headers: { "X-User-Id": USER_ID },
		});

		expect(listed.status).toBe(200);
		expect(listed.data.todos).toHaveLength(1);
		expect(listed.data.todos[0].description).toBe("2 liters");
	});
});
