import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export * from "../better-auth/auth-schema";

import { user } from "../better-auth/auth-schema";

export const aiCallLogs = pgTable(
	"ai_call_logs",
	{
		id: varchar("id", { length: 26 }).primaryKey(),
		userId: varchar("user_id", { length: 26 }).references(() => user.id, {
			onDelete: "cascade",
		}),
		source: varchar("source", { length: 50 }),
		prompt: text("prompt").notNull(),
		options: jsonb("options").$type<{
			maxTokens?: number;
			temperature?: number;
		}>(),
		response: text("response").notNull(),
		inputTokens: integer("input_tokens"),
		outputTokens: integer("output_tokens"),
		thinkingTokens: integer("thinking_tokens"),
		totalTokens: integer("total_tokens"),
		durationMs: integer("duration_ms").notNull(),
		provider: varchar("provider", { length: 255 }).notNull(),
		model: varchar("model", { length: 255 }),
		error: text("error"),
		createdAt: timestamp("created_at")
			.notNull()
			.$default(() => new Date()),
	},
	(table) => [
		index("ai_call_logs_user_id_idx").on(table.userId),
		index("ai_call_logs_source_idx").on(table.source),
		index("ai_call_logs_created_at_idx").on(table.createdAt),
	],
);

export const aiCallLogsRelations = relations(aiCallLogs, ({ one }) => ({
	user: one(user, {
		fields: [aiCallLogs.userId],
		references: [user.id],
	}),
}));

export const todosTable = pgTable(
	"todos",
	{
		id: varchar("id", { length: 26 }).primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 200 }).notNull(),
		description: text("description"),
		completed: boolean("completed").notNull().default(false),
		createdAt: timestamp("created_at")
			.notNull()
			.$default(() => new Date()),
		updatedAt: timestamp("updated_at")
			.notNull()
			.$default(() => new Date()),
	},
	(table) => [
		index("todos_user_id_idx").on(table.userId),
		index("todos_created_at_idx").on(table.createdAt),
	],
);

export const todosRelations = relations(todosTable, ({ one }) => ({
	user: one(user, {
		fields: [todosTable.userId],
		references: [user.id],
	}),
}));
