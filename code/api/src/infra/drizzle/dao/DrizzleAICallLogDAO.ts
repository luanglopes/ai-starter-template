import { and, count, eq, gte } from "drizzle-orm";
import type { AICallLogDAO } from "../../../app/dao/AICallLogDAO";
import type {
	AICallLog,
	CreateAICallLogInput,
} from "../../../app/domain/aiCallLog";
import type { Connection } from "../connection";
import { aiCallLogs } from "../schema";
import { generateULID } from "../utils/generateULID";

export class DrizzleAICallLogDAO implements AICallLogDAO {
	constructor(private db: Connection) {}

	async create(input: CreateAICallLogInput): Promise<AICallLog> {
		const now = new Date();
		const result = await this.db
			.insert(aiCallLogs)
			.values({
				id: generateULID(),
				userId: input.userId ?? null,
				source: input.source ?? null,
				prompt: input.prompt,
				options: input.options ?? null,
				response: input.response,
				inputTokens: input.inputTokens ?? null,
				outputTokens: input.outputTokens ?? null,
				thinkingTokens: input.thinkingTokens ?? null,
				totalTokens: input.totalTokens ?? null,
				durationMs: input.durationMs,
				provider: input.provider,
				model: input.model ?? null,
				error: input.error ?? null,
				createdAt: now,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async countByUserSourceSince(params: {
		userId: string;
		source: string;
		since: Date;
	}): Promise<number> {
		const result = await this.db
			.select({ value: count() })
			.from(aiCallLogs)
			.where(
				and(
					eq(aiCallLogs.userId, params.userId),
					eq(aiCallLogs.source, params.source),
					gte(aiCallLogs.createdAt, params.since),
				),
			);

		return Number(result[0]?.value ?? 0);
	}

	private mapToEntity(row: typeof aiCallLogs.$inferSelect): AICallLog {
		return {
			id: row.id,
			userId: row.userId,
			source: row.source,
			prompt: row.prompt,
			options: row.options,
			response: row.response,
			inputTokens: row.inputTokens,
			outputTokens: row.outputTokens,
			thinkingTokens: row.thinkingTokens,
			totalTokens: row.totalTokens,
			durationMs: row.durationMs,
			provider: row.provider,
			model: row.model,
			error: row.error,
			createdAt: row.createdAt,
		};
	}
}
