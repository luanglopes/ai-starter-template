import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOllamaProvider, OllamaProvider } from "./OllamaProvider";

describe("OllamaProvider", () => {
	const mockFetch = vi.fn();
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = mockFetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.clearAllMocks();
	});

	describe("generateText", () => {
		it("should call Ollama API with correct parameters", async () => {
			const mockResponse = {
				model: "gemini-3-flash-preview:cloud",
				response: "Generated text response",
				done: true,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const provider = new OllamaProvider();
			const result = await provider.generateText("Test prompt");

			expect(mockFetch).toHaveBeenCalledWith(
				"http://localhost:11434/api/generate",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model: "gemini-3-flash-preview:cloud",
						prompt: "Test prompt",
						stream: false,
						format: "json",
						options: {
							temperature: undefined,
							num_predict: undefined,
						},
					}),
				},
			);
			expect(result).toBe("Generated text response");
		});

		it("should pass generation options to Ollama", async () => {
			const mockResponse = {
				model: "gemini-3-flash-preview:cloud",
				response: "Response with options",
				done: true,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const provider = new OllamaProvider();
			await provider.generateText("Test prompt", {
				temperature: 0.8,
				maxTokens: 1024,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					body: JSON.stringify({
						model: "gemini-3-flash-preview:cloud",
						prompt: "Test prompt",
						stream: false,
						format: "json",
						options: {
							temperature: 0.8,
							num_predict: 1024,
						},
					}),
				}),
			);
		});

		it("should use custom config when provided", async () => {
			const mockResponse = {
				model: "mistral",
				response: "Custom model response",
				done: true,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const provider = new OllamaProvider({
				baseUrl: "http://custom:8080",
				model: "mistral",
			});
			await provider.generateText("Test prompt");

			expect(mockFetch).toHaveBeenCalledWith(
				"http://custom:8080/api/generate",
				expect.objectContaining({
					body: expect.stringContaining('"model":"mistral"'),
				}),
			);
		});

		it("should throw error on API failure", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: () => Promise.resolve("Model not found"),
			});

			const provider = new OllamaProvider();

			await expect(provider.generateText("Test prompt")).rejects.toThrow(
				"Ollama API error: 500 Internal Server Error - Model not found",
			);
		});
	});

	describe("getOllamaProvider", () => {
		it("should return an OllamaProvider instance", () => {
			const provider = getOllamaProvider();
			expect(provider).toBeInstanceOf(OllamaProvider);
		});

		it("should pass config to OllamaProvider", async () => {
			const mockResponse = {
				model: "codellama",
				response: "Code response",
				done: true,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const provider = getOllamaProvider({ model: "codellama" });
			await provider.generateText("Test");

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					body: expect.stringContaining('"model":"codellama"'),
				}),
			);
		});
	});
});
