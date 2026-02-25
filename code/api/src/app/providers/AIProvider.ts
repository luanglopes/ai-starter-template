export interface AIProvider {
	generateText(prompt: string, options?: GenerateTextOptions): Promise<string>;

	/**
	 * Generate text with metadata including token usage.
	 */
	generateTextWithMetadata(
		prompt: string,
		options?: GenerateTextOptions,
	): Promise<AIGenerationResult>;

	/**
	 * The name of the AI provider (e.g., "ollama", "google-gemini", "mock").
	 */
	readonly providerName: string;

	/**
	 * The model name being used (e.g., "gemini-3-flash-preview:cloud").
	 */
	readonly modelName?: string;
}

export type ToolDefinition = {
	name: string;
	description: string;
	parameters: Record<string, unknown>; // JSON Schema
};

export type ToolCall = {
	name: string;
	args: Record<string, unknown>;
};

export type ToolResult = {
	name: string;
	result: Record<string, unknown>;
};

export type ToolHandler = (call: ToolCall) => Promise<ToolResult>;

export type GenerateTextOptions = {
	systemPrompt?: string;
	maxTokens?: number;
	temperature?: number;
	responseSchema?: import("valibot").GenericSchema;
	tools?: ToolDefinition[];
	toolHandler?: ToolHandler;
};

type AITokenUsage = {
	inputTokens?: number;
	outputTokens?: number;
	thinkingTokens?: number;
	totalTokens?: number;
};

export type AIGenerationResult = {
	text: string;
	usage?: AITokenUsage;
};
