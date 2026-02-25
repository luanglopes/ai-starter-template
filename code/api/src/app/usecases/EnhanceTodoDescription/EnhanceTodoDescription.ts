import type { AICallLogDAO } from "../../dao/AICallLogDAO";
import type { TodoDAO } from "../../dao/TodoDAO";
import { AILimitError, NotFoundError } from "../../domain/errors";
import type { AIProvider } from "../../providers/AIProvider";
import type { EntitlementProvider } from "../../providers/EntitlementProvider";
import { toPlan } from "../common/entitlements";
import { getAIEnhancementLimit } from "../common/planLimits";
import type {
	EnhanceTodoDescriptionInput,
	EnhanceTodoDescriptionOutput,
	EnhanceTodoDescriptionUseCase,
} from "./types";

function getMonthStart(): Date {
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
	);
}

export class EnhanceTodoDescription implements EnhanceTodoDescriptionUseCase {
	constructor(
		private todoDAO: TodoDAO,
		private aiProvider: AIProvider,
		private entitlementProvider: EntitlementProvider,
		private aiCallLogDAO: AICallLogDAO,
	) {}

	async execute(
		params: EnhanceTodoDescriptionInput,
	): Promise<EnhanceTodoDescriptionOutput> {
		const todo = await this.todoDAO.getById({
			id: params.id,
			userId: params.userId,
		});
		if (!todo) {
			throw new NotFoundError("Todo not found");
		}

		const customerPlan = await this.entitlementProvider.getCustomerPlan(
			params.userId,
		);
		const plan = toPlan(customerPlan.productId);
		const limit = getAIEnhancementLimit(plan);
		const since = getMonthStart();
		const usedThisMonth = await this.aiCallLogDAO.countByUserSourceSince({
			userId: params.userId,
			source: "todo-enhance",
			since,
		});

		if (usedThisMonth >= limit) {
			throw new AILimitError("You reached your monthly AI enhancement limit", {
				limitType: "ai_enhancements",
				plan,
				used: usedThisMonth,
				limit,
			});
		}

		const prompt = [
			"Improve the todo description below.",
			"Keep it concise, actionable, and specific.",
			"Return plain text only (no markdown).",
			`Title: ${todo.title}`,
			`Current description: ${todo.description ?? "none"}`,
		].join("\n");

		const start = performance.now();
		const aiResult = await this.aiProvider.generateTextWithMetadata(prompt, {
			temperature: 0.4,
			maxTokens: 180,
		});
		const durationMs = Math.round(performance.now() - start);

		await this.aiCallLogDAO.create({
			userId: params.userId,
			source: "todo-enhance",
			prompt,
			options: {
				temperature: 0.4,
				maxTokens: 180,
			},
			response: aiResult.text,
			inputTokens: aiResult.usage?.inputTokens,
			outputTokens: aiResult.usage?.outputTokens,
			thinkingTokens: aiResult.usage?.thinkingTokens,
			totalTokens: aiResult.usage?.totalTokens,
			durationMs,
			provider: this.aiProvider.providerName,
			model: this.aiProvider.modelName,
		});

		const enhancedDescription = aiResult.text.trim();
		const updated = await this.todoDAO.update({
			id: todo.id,
			userId: todo.userId,
			description: enhancedDescription,
		});

		if (!updated) {
			throw new NotFoundError("Todo not found");
		}

		return {
			todo: updated,
			usedThisMonth: usedThisMonth + 1,
			limit,
		};
	}
}
