import { toJsonSchema } from "@valibot/to-json-schema";
import type {
	AIGenerationResult,
	AIProvider,
	GenerateTextOptions,
} from "../../app/providers/AIProvider";

export type OllamaConfig = {
	baseUrl?: string;
	model?: string;
};

type OllamaGenerateRequest = {
	model: string;
	prompt: string;
	system?: string;
	stream: false;
	format: "json" | Record<string, unknown>;
	options?: {
		temperature?: number;
		num_predict?: number;
	};
};

type OllamaGenerateResponse = {
	model: string;
	response: string;
	done: boolean;
	prompt_eval_count?: number;
	eval_count?: number;
};

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "gemini-3-flash-preview:cloud";

export class OllamaProvider implements AIProvider {
	private baseUrl: string;
	private model: string;

	readonly providerName = "ollama";

	get modelName(): string {
		return this.model;
	}

	constructor(config: OllamaConfig = {}) {
		this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
		this.model = config.model ?? DEFAULT_MODEL;
	}

	async generateText(
		prompt: string,
		options?: GenerateTextOptions,
	): Promise<string> {
		const result = await this.generateTextWithMetadata(prompt, options);
		return result.text;
	}

	async generateTextWithMetadata(
		prompt: string,
		options?: GenerateTextOptions,
	): Promise<AIGenerationResult> {
		const format: OllamaGenerateRequest["format"] = options?.responseSchema
			? (toJsonSchema(options.responseSchema) as Record<string, unknown>)
			: "json";

		const requestBody: OllamaGenerateRequest = {
			model: this.model,
			prompt,
			system: options?.systemPrompt,
			stream: false,
			format,
			options: {
				temperature: options?.temperature,
				num_predict: options?.maxTokens,
			},
		};

		const response = await fetch(`${this.baseUrl}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		const data = (await response.json()) as OllamaGenerateResponse;
		console.log("Ollama response:", data.response);

		const inputTokens = data.prompt_eval_count;
		const outputTokens = data.eval_count;
		const totalTokens =
			inputTokens !== undefined && outputTokens !== undefined
				? inputTokens + outputTokens
				: undefined;

		return {
			text: data.response,
			usage: {
				inputTokens,
				outputTokens,
				totalTokens,
			},
		};
	}
}

export function getOllamaProvider(config: OllamaConfig = {}): AIProvider {
	return new OllamaProvider(config);
}
