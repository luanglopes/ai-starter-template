import { toJsonSchema } from "@valibot/to-json-schema";
import type {
	AIGenerationResult,
	AIProvider,
	GenerateTextOptions,
} from "../../app/providers/AIProvider";
import type {
	GeminiContent,
	GeminiFunctionCall,
	GeminiRequest,
	GeminiResponse,
	GeminiToolDeclaration,
} from "./types";

const MAX_TOOL_ROUNDS = 5;

export class GeminiProvider implements AIProvider {
	readonly providerName = "gemini";

	constructor(
		private apiKey: string,
		private model: string = "gemini-2.0-flash",
		private baseUrl: string = "https://generativelanguage.googleapis.com/v1beta",
	) {}

	get modelName(): string {
		return this.model;
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
		const request: GeminiRequest = {
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		};

		if (options?.systemPrompt) {
			request.systemInstruction = {
				parts: [{ text: options.systemPrompt }],
			};
		}

		const tools = options?.tools;
		const responseSchema = options?.responseSchema;

		request.generationConfig = {};
		if (options?.maxTokens) {
			request.generationConfig.maxOutputTokens = options.maxTokens;
		}
		if (options?.temperature !== undefined) {
			request.generationConfig.temperature = options.temperature;
		}
		// Gemini does not support responseMimeType with function calling,
		// so we defer JSON schema to a final call after tool rounds complete
		if (responseSchema && !tools?.length) {
			request.generationConfig.responseMimeType = "application/json";
			request.generationConfig.responseJsonSchema = toJsonSchema(
				responseSchema,
			) as Record<string, unknown>;
		}

		// Map tool definitions to Gemini format
		if (tools?.length) {
			const geminiTools: GeminiToolDeclaration = {
				functionDeclarations: tools.map((tool) => ({
					name: tool.name,
					description: tool.description,
					parameters: tool.parameters,
				})),
			};
			request.tools = [geminiTools];
		}

		// Aggregated usage across all rounds
		let totalInputTokens = 0;
		let totalOutputTokens = 0;
		let totalThinkingTokens = 0;
		let totalTokens = 0;

		for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
			const response = await this.callApi(request);

			if (response.error) {
				throw new Error(
					`Gemini API error: ${response.error.code} ${response.error.status} - ${response.error.message}`,
				);
			}

			// Accumulate usage
			if (response.usageMetadata) {
				totalInputTokens += response.usageMetadata.promptTokenCount ?? 0;
				totalOutputTokens += response.usageMetadata.candidatesTokenCount ?? 0;
				totalThinkingTokens += response.usageMetadata.thoughtsTokenCount ?? 0;
				totalTokens += response.usageMetadata.totalTokenCount ?? 0;
			}

			const candidate = response.candidates?.[0];
			if (!candidate) {
				throw new Error("Gemini API returned no candidates");
			}

			// Check for function calls
			const functionCalls = candidate.content.parts.filter(
				(part): part is { functionCall: GeminiFunctionCall } =>
					"functionCall" in part,
			);

			if (functionCalls.length === 0) {
				// No more function calls — if we had tools + responseSchema,
				// make a final structured call to get proper JSON output
				if (tools?.length && responseSchema) {
					// Append the model's final text response to conversation
					request.contents.push({
						role: "model",
						parts: candidate.content.parts,
					});
					return this.finalStructuredCall(
						request,
						responseSchema,
						totalInputTokens,
						totalOutputTokens,
						totalThinkingTokens,
						totalTokens,
					);
				}

				// No tools or no schema — return text directly
				const textPart = candidate.content.parts.find(
					(part): part is { text: string } => "text" in part,
				);

				if (!textPart) {
					throw new Error("Gemini API response contains no text");
				}

				return {
					text: textPart.text,
					usage: {
						inputTokens: totalInputTokens,
						outputTokens: totalOutputTokens,
						thinkingTokens: totalThinkingTokens,
						totalTokens,
					},
				};
			}

			// Function calls found — execute via toolHandler
			if (!options?.toolHandler) {
				throw new Error(
					"Gemini returned function calls but no toolHandler was provided",
				);
			}

			// Append the model's response (with function calls) to contents
			request.contents.push({
				role: "model",
				parts: candidate.content.parts,
			});

			// Execute each function call and build function response parts
			const functionResponseParts: GeminiContent["parts"] = [];
			for (const fc of functionCalls) {
				const toolResult = await options.toolHandler({
					name: fc.functionCall.name,
					args: fc.functionCall.args,
				});
				functionResponseParts.push({
					functionResponse: {
						name: toolResult.name,
						response: toolResult.result,
					},
				});
			}

			// Append the function responses as a "user" turn
			request.contents.push({
				role: "user",
				parts: functionResponseParts,
			});
		}

		throw new Error(
			`Max tool call rounds (${MAX_TOOL_ROUNDS}) exceeded. The model kept requesting tool calls.`,
		);
	}

	/**
	 * After tool-calling rounds complete, make a final API call with
	 * JSON schema enforcement (without tools) to get structured output.
	 */
	private async finalStructuredCall(
		request: GeminiRequest,
		responseSchema: import("valibot").GenericSchema,
		prevInputTokens: number,
		prevOutputTokens: number,
		prevThinkingTokens: number,
		prevTotalTokens: number,
	): Promise<AIGenerationResult> {
		// Build a new request with the full conversation but swap tools for JSON schema
		const structuredRequest: GeminiRequest = {
			contents: request.contents,
			systemInstruction: request.systemInstruction,
			generationConfig: {
				...request.generationConfig,
				responseMimeType: "application/json",
				responseJsonSchema: toJsonSchema(responseSchema) as Record<
					string,
					unknown
				>,
			},
			// No tools — this forces a text/JSON response
		};

		const response = await this.callApi(structuredRequest);

		if (response.error) {
			throw new Error(
				`Gemini API error: ${response.error.code} ${response.error.status} - ${response.error.message}`,
			);
		}

		const candidate = response.candidates?.[0];
		if (!candidate) {
			throw new Error("Gemini API returned no candidates");
		}

		const textPart = candidate.content.parts.find(
			(part): part is { text: string } => "text" in part,
		);

		if (!textPart) {
			throw new Error("Gemini API response contains no text");
		}

		let totalInputTokens = prevInputTokens;
		let totalOutputTokens = prevOutputTokens;
		let totalThinkingTokens = prevThinkingTokens;
		let totalTokens = prevTotalTokens;
		if (response.usageMetadata) {
			totalInputTokens += response.usageMetadata.promptTokenCount ?? 0;
			totalOutputTokens += response.usageMetadata.candidatesTokenCount ?? 0;
			totalThinkingTokens += response.usageMetadata.thoughtsTokenCount ?? 0;
			totalTokens += response.usageMetadata.totalTokenCount ?? 0;
		}

		return {
			text: textPart.text,
			usage: {
				inputTokens: totalInputTokens,
				outputTokens: totalOutputTokens,
				thinkingTokens: totalThinkingTokens,
				totalTokens,
			},
		};
	}

	private async callApi(request: GeminiRequest): Promise<GeminiResponse> {
		const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request),
		});

		if (response.status === 429) {
			throw new Error(
				"Gemini API rate limit exceeded. Please try again later.",
			);
		}

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		return (await response.json()) as GeminiResponse;
	}
}
