import type { GenerateTextOptions } from "../providers/AIProvider";

export type AICallLogOptions = Omit<GenerateTextOptions, "toolHandler">;

export type AICallLog = {
	id: string;
	userId: string | null;
	source: string | null;
	prompt: string;
	options: AICallLogOptions | null;
	response: string;
	inputTokens: number | null;
	outputTokens: number | null;
	thinkingTokens: number | null;
	totalTokens: number | null;
	durationMs: number;
	provider: string;
	model: string | null;
	error: string | null;
	createdAt: Date;
};

export type CreateAICallLogInput = {
	userId?: string | null;
	source?: string | null;
	prompt: string;
	options?: AICallLogOptions | null;
	response: string;
	inputTokens?: number | null;
	outputTokens?: number | null;
	thinkingTokens?: number | null;
	totalTokens?: number | null;
	durationMs: number;
	provider: string;
	model?: string | null;
	error?: string | null;
};
