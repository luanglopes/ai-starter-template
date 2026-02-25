import type { AICallLogDAO } from "../../app/dao/AICallLogDAO";
import type { TodoDAO } from "../../app/dao/TodoDAO";
import type { Connection } from "../drizzle/connection";
import { DrizzleAICallLogDAO } from "../drizzle/dao/DrizzleAICallLogDAO";
import { DrizzleTodoDAO } from "../drizzle/dao/DrizzleTodoDAO";
import { ServiceLocator } from "../ServiceLocator";

export function getAICallLogDAO(db: Connection): AICallLogDAO {
	const mock = ServiceLocator.get("aiCallLogDAO");
	if (mock) return mock;
	return new DrizzleAICallLogDAO(db);
}

export function getTodoDAO(db: Connection): TodoDAO {
	const mock = ServiceLocator.get("todoDAO");
	if (mock) return mock;
	return new DrizzleTodoDAO(db);
}
