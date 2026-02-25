import type { AICallLogDAO } from "../../app/dao/AICallLogDAO";
import type {
	AIGenerationResult,
	AIProvider,
	GenerateTextOptions,
} from "../../app/providers/AIProvider";

/**
 * Function to keep the worker alive until a promise resolves.
 * In Cloudflare Workers, this is ctx.waitUntil().
 */
export type WaitUntilFn = (promise: Promise<unknown>) => void;

/**
 * Decorator that wraps an AIProvider to log all calls to the database.
 * - Times each AI call using performance.now()
 * - Logs prompt, response, token usage, and duration
 * - Captures errors without breaking the request
 * - Uses waitUntil to ensure logging completes in Cloudflare Workers
 */
export class LoggingAIProviderWrapper implements AIProvider {
	readonly providerName: string;
	readonly modelName?: string;

	constructor(
		private inner: AIProvider,
		private aiCallLogDAO: AICallLogDAO,
		private userId: string | null,
		private waitUntil: WaitUntilFn,
		private source: string | null = null,
	) {
		this.providerName = inner.providerName;
		this.modelName = inner.modelName;
	}

	async generateText(
		prompt: string,
		options?: GenerateTextOptions,
	): Promise<string> {
		const startTime = performance.now();
		let response = "";
		let error: string | null = null;
		let usage: AIGenerationResult["usage"] | undefined;

		try {
			const result = await this.inner.generateTextWithMetadata(prompt, options);
			response = result.text;
			usage = result.usage;

			return response;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			throw err;
		} finally {
			const durationMs = Math.round(performance.now() - startTime);

			// Use waitUntil to ensure logging completes even after response is sent
			const logPromise = this.logCall({
				prompt,
				options,
				response,
				usage,
				durationMs,
				error,
			}).catch((logErr) => {
				// Don't let logging failures affect the request
				console.error("Failed to log AI call:", logErr);
			});

			this.waitUntil(logPromise);
		}
	}

	async generateTextWithMetadata(
		prompt: string,
		options?: GenerateTextOptions,
	): Promise<AIGenerationResult> {
		const startTime = performance.now();
		let result: AIGenerationResult = { text: "" };
		let error: string | null = null;

		try {
			result = await this.inner.generateTextWithMetadata(prompt, options);

			return result;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			throw err;
		} finally {
			const durationMs = Math.round(performance.now() - startTime);

			// Use waitUntil to ensure logging completes even after response is sent
			const logPromise = this.logCall({
				prompt,
				options,
				response: result.text,
				usage: result.usage,
				durationMs,
				error,
			}).catch((logErr) => {
				// Don't let logging failures affect the request
				console.error("Failed to log AI call:", logErr);
			});

			this.waitUntil(logPromise);
		}
	}

	private async logCall(params: {
		prompt: string;
		options?: GenerateTextOptions;
		response: string;
		usage?: AIGenerationResult["usage"];
		durationMs: number;
		error: string | null;
	}): Promise<void> {
		const { toolHandler, ...serializableOptions } = params.options ?? {};
		await this.aiCallLogDAO.create({
			userId: this.userId,
			source: this.source,
			prompt: params.prompt,
			options:
				Object.keys(serializableOptions).length > 0
					? serializableOptions
					: null,
			response: params.response,
			inputTokens: params.usage?.inputTokens ?? null,
			outputTokens: params.usage?.outputTokens ?? null,
			thinkingTokens: params.usage?.thinkingTokens ?? null,
			totalTokens: params.usage?.totalTokens ?? null,
			durationMs: params.durationMs,
			provider: this.providerName,
			model: this.modelName ?? null,
			error: params.error,
		});
	}
}
