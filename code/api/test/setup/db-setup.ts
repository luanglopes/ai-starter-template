import { beforeEach } from "vitest";

beforeEach(async () => {
	const { resetDatabase } = await import("../helpers/db-helper");
	await resetDatabase();
});
