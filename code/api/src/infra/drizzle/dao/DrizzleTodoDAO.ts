import { and, count, desc, eq } from "drizzle-orm";
import type { TodoDAO } from "../../../app/dao/TodoDAO";
import type {
	CreateTodoInput,
	Todo,
	UpdateTodoInput,
} from "../../../app/domain/Todo";
import type { Connection } from "../connection";
import { todosTable } from "../schema";
import { generateULID } from "../utils/generateULID";

export class DrizzleTodoDAO implements TodoDAO {
	constructor(private db: Connection) {}

	async listByUserId(params: {
		userId: string;
		limit: number;
		offset: number;
	}): Promise<{ todos: Todo[]; total: number }> {
		const rows = await this.db
			.select()
			.from(todosTable)
			.where(eq(todosTable.userId, params.userId))
			.orderBy(desc(todosTable.createdAt))
			.limit(params.limit)
			.offset(params.offset);

		const totalRows = await this.db
			.select({ value: count() })
			.from(todosTable)
			.where(eq(todosTable.userId, params.userId));

		return {
			todos: rows.map((row) => this.mapToEntity(row)),
			total: Number(totalRows[0]?.value ?? 0),
		};
	}

	async getById(params: { id: string; userId: string }): Promise<Todo | null> {
		const rows = await this.db
			.select()
			.from(todosTable)
			.where(
				and(eq(todosTable.id, params.id), eq(todosTable.userId, params.userId)),
			)
			.limit(1);

		return rows[0] ? this.mapToEntity(rows[0]) : null;
	}

	async create(input: CreateTodoInput): Promise<Todo> {
		const now = new Date();
		const rows = await this.db
			.insert(todosTable)
			.values({
				id: generateULID(),
				userId: input.userId,
				title: input.title,
				description: input.description ?? null,
				completed: false,
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		return this.mapToEntity(rows[0]);
	}

	async update(input: UpdateTodoInput): Promise<Todo | null> {
		const updates: Partial<typeof todosTable.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (input.title !== undefined) updates.title = input.title;
		if (input.description !== undefined)
			updates.description = input.description ?? null;
		if (input.completed !== undefined) updates.completed = input.completed;

		const rows = await this.db
			.update(todosTable)
			.set(updates)
			.where(
				and(eq(todosTable.id, input.id), eq(todosTable.userId, input.userId)),
			)
			.returning();

		return rows[0] ? this.mapToEntity(rows[0]) : null;
	}

	async delete(params: { id: string; userId: string }): Promise<void> {
		await this.db
			.delete(todosTable)
			.where(
				and(eq(todosTable.id, params.id), eq(todosTable.userId, params.userId)),
			);
	}

	private mapToEntity(row: typeof todosTable.$inferSelect): Todo {
		return {
			id: row.id,
			userId: row.userId,
			title: row.title,
			description: row.description ?? undefined,
			completed: row.completed,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		};
	}
}
