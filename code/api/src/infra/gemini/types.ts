// --- Request types ---

export type GeminiContent = {
	role: "user" | "model" | "function";
	parts: GeminiPart[];
};

export type GeminiPart =
	| { text: string }
	| { functionCall: GeminiFunctionCall }
	| { functionResponse: GeminiFunctionResponse };

export type GeminiFunctionCall = {
	name: string;
	args: Record<string, unknown>;
};

export type GeminiFunctionResponse = {
	name: string;
	response: Record<string, unknown>;
};

export type GeminiToolDeclaration = {
	functionDeclarations: GeminiFunctionDeclaration[];
};

export type GeminiFunctionDeclaration = {
	name: string;
	description: string;
	parameters: Record<string, unknown>;
};

export type GeminiGenerationConfig = {
	responseMimeType?: string;
	responseJsonSchema?: Record<string, unknown>;
	maxOutputTokens?: number;
	temperature?: number;
};

export type GeminiRequest = {
	contents: GeminiContent[];
	systemInstruction?: {
		parts: { text: string }[];
	};
	tools?: GeminiToolDeclaration[];
	generationConfig?: GeminiGenerationConfig;
};

// --- Response types ---

export type GeminiResponse = {
	candidates?: GeminiCandidate[];
	usageMetadata?: GeminiUsageMetadata;
	error?: GeminiError;
};

export type GeminiCandidate = {
	content: {
		role: string;
		parts: GeminiPart[];
	};
	finishReason?: string;
};

export type GeminiUsageMetadata = {
	promptTokenCount?: number;
	candidatesTokenCount?: number;
	thoughtsTokenCount?: number;
	totalTokenCount?: number;
};

export type GeminiError = {
	code: number;
	message: string;
	status: string;
};
