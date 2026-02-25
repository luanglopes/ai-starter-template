import type { AICallLogDAO } from "../../app/dao/AICallLogDAO";
import type { AIProvider } from "../../app/providers/AIProvider";
import {
	LoggingAIProviderWrapper,
	type WaitUntilFn,
} from "../ai/LoggingAIProviderWrapper";
import { GeminiProvider } from "../gemini/GeminiProvider";
import { OllamaProvider } from "../ollama/OllamaProvider";
import { ServiceLocator } from "../ServiceLocator";

export function getAIProvider(env: Env): AIProvider {
	// Check if test has registered a provider first
	const testProvider = ServiceLocator.get("aiProvider");
	if (testProvider) {
		return testProvider;
	}

	// Use Gemini in production when API key is available
	if (env.GEMINI_API_KEY) {
		return new GeminiProvider(env.GEMINI_API_KEY);
	}

	// Fall back to Ollama for local development
	return new OllamaProvider({
		baseUrl: env.OLLAMA_BASE_URL,
	});
}

/**
 * Get an AI provider wrapped with logging for workflow/background contexts.
 * Uses null userId (no user context) and a no-op waitUntil since the workflow
 * step itself keeps the worker alive.
 *
 * @param env - Environment configuration
 * @param aiCallLogDAO - DAO for persisting logs
 * @param source - Source label for the AI call (e.g. "todo-enhance")
 */
export function getWorkflowLoggingAIProvider(
	env: Env,
	aiCallLogDAO: AICallLogDAO,
	source: string,
): AIProvider {
	const innerProvider = getAIProvider(env);
	const noopWaitUntil: WaitUntilFn = (p) => {
		p.catch(() => {});
	};
	return new LoggingAIProviderWrapper(
		innerProvider,
		aiCallLogDAO,
		null,
		noopWaitUntil,
		source,
	);
}
