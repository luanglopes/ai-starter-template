import * as v from "valibot";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ToolHandler } from "../../app/providers/AIProvider";
import { GeminiProvider } from "./GeminiProvider";
import type { GeminiResponse } from "./types";

function makeTextResponse(
	text: string,
	usage?: { prompt?: number; candidates?: number; total?: number },
): GeminiResponse {
	return {
		candidates: [
			{
				content: {
					role: "model",
					parts: [{ text }],
				},
				finishReason: "STOP",
			},
		],
		usageMetadata: usage
			? {
					promptTokenCount: usage.prompt ?? 0,
					candidatesTokenCount: usage.candidates ?? 0,
					totalTokenCount: usage.total ?? 0,
				}
			: undefined,
	};
}

function makeFunctionCallResponse(
	calls: { name: string; args: Record<string, unknown> }[],
	usage?: { prompt?: number; candidates?: number; total?: number },
): GeminiResponse {
	return {
		candidates: [
			{
				content: {
					role: "model",
					parts: calls.map((c) => ({
						functionCall: { name: c.name, args: c.args },
					})),
				},
				finishReason: "STOP",
			},
		],
		usageMetadata: usage
			? {
					promptTokenCount: usage.prompt ?? 0,
					candidatesTokenCount: usage.candidates ?? 0,
					totalTokenCount: usage.total ?? 0,
				}
			: undefined,
	};
}

describe("GeminiProvider", () => {
	let provider: GeminiProvider;

	beforeEach(() => {
		vi.restoreAllMocks();
		provider = new GeminiProvider("test-key", "gemini-2.0-flash-lite");
	});

	describe("without tools (no regression)", () => {
		it("should return text response as before", async () => {
			vi.spyOn(global, "fetch").mockResolvedValueOnce(
				new Response(
					JSON.stringify(
						makeTextResponse("Hello world", {
							prompt: 10,
							candidates: 5,
							total: 15,
						}),
					),
					{ status: 200 },
				),
			);

			const result = await provider.generateTextWithMetadata("Say hello");

			expect(result.text).toBe("Hello world");
			expect(result.usage?.inputTokens).toBe(10);
			expect(result.usage?.outputTokens).toBe(5);
			expect(result.usage?.totalTokens).toBe(15);
		});

		it("should not include tools in request when none provided", async () => {
			const fetchSpy = vi
				.spyOn(global, "fetch")
				.mockResolvedValueOnce(
					new Response(JSON.stringify(makeTextResponse("ok")), { status: 200 }),
				);

			await provider.generateTextWithMetadata("Hi");

			const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
			expect(body.tools).toBeUndefined();
		});
	});

	describe("with tools", () => {
		const toolDefs = [
			{
				name: "getStockPriceHistory",
				description: "Get stock price history",
				parameters: {
					type: "object",
					properties: {
						ticker: { type: "string" },
						startDate: { type: "string" },
						endDate: { type: "string" },
					},
					required: ["ticker", "startDate", "endDate"],
				},
			},
		];

		it("should include tool declarations in API request", async () => {
			const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
				new Response(JSON.stringify(makeTextResponse("result")), {
					status: 200,
				}),
			);

			await provider.generateTextWithMetadata("Analyze AAPL", {
				tools: toolDefs,
				toolHandler: vi.fn(),
			});

			const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
			expect(body.tools).toHaveLength(1);
			expect(body.tools[0].functionDeclarations).toHaveLength(1);
			expect(body.tools[0].functionDeclarations[0].name).toBe(
				"getStockPriceHistory",
			);
		});

		it("should execute tool-calling loop: function call → handler → function response → text", async () => {
			const toolHandler: ToolHandler = vi.fn().mockResolvedValue({
				name: "getStockPriceHistory",
				result: { ticker: "AAPL", startPrice: 150, endPrice: 160 },
			});

			// First call: model returns function call
			// Second call: model returns text
			vi.spyOn(global, "fetch")
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							makeFunctionCallResponse(
								[
									{
										name: "getStockPriceHistory",
										args: {
											ticker: "AAPL",
											startDate: "2025-01-01",
											endDate: "2025-01-31",
										},
									},
								],
								{ prompt: 100, candidates: 20, total: 120 },
							),
						),
						{ status: 200 },
					),
				)
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							makeTextResponse("AAPL went up 6.67%", {
								prompt: 200,
								candidates: 50,
								total: 250,
							}),
						),
						{ status: 200 },
					),
				);

			const result = await provider.generateTextWithMetadata("Analyze AAPL", {
				tools: toolDefs,
				toolHandler,
			});

			expect(toolHandler).toHaveBeenCalledOnce();
			expect(toolHandler).toHaveBeenCalledWith({
				name: "getStockPriceHistory",
				args: {
					ticker: "AAPL",
					startDate: "2025-01-01",
					endDate: "2025-01-31",
				},
			});
			expect(result.text).toBe("AAPL went up 6.67%");
		});

		it("should send function response in correct format", async () => {
			const toolHandler: ToolHandler = vi.fn().mockResolvedValue({
				name: "getStockPriceHistory",
				result: { startPrice: 150 },
			});

			const fetchSpy = vi
				.spyOn(global, "fetch")
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							makeFunctionCallResponse([
								{
									name: "getStockPriceHistory",
									args: { ticker: "AAPL" },
								},
							]),
						),
						{ status: 200 },
					),
				)
				.mockResolvedValueOnce(
					new Response(JSON.stringify(makeTextResponse("done")), {
						status: 200,
					}),
				);

			await provider.generateTextWithMetadata("Analyze", {
				tools: toolDefs,
				toolHandler,
			});

			// Check the second API call has the conversation history
			const secondCallBody = JSON.parse(
				fetchSpy.mock.calls[1][1]?.body as string,
			);
			expect(secondCallBody.contents).toHaveLength(3); // user + model + function response
			expect(secondCallBody.contents[1].role).toBe("model");
			expect(secondCallBody.contents[2].role).toBe("user");
			expect(secondCallBody.contents[2].parts[0].functionResponse).toEqual({
				name: "getStockPriceHistory",
				response: { startPrice: 150 },
			});
		});

		it("should aggregate usage across multiple rounds", async () => {
			const toolHandler: ToolHandler = vi.fn().mockResolvedValue({
				name: "getStockPriceHistory",
				result: {},
			});

			vi.spyOn(global, "fetch")
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							makeFunctionCallResponse(
								[
									{
										name: "getStockPriceHistory",
										args: {},
									},
								],
								{ prompt: 100, candidates: 20, total: 120 },
							),
						),
						{ status: 200 },
					),
				)
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							makeTextResponse("result", {
								prompt: 200,
								candidates: 50,
								total: 250,
							}),
						),
						{ status: 200 },
					),
				);

			const result = await provider.generateTextWithMetadata("Analyze", {
				tools: toolDefs,
				toolHandler,
			});

			expect(result.usage).toEqual({
				inputTokens: 300,
				outputTokens: 70,
				thinkingTokens: 0,
				totalTokens: 370,
			});
		});

		it("should throw when max tool rounds exceeded", async () => {
			const toolHandler: ToolHandler = vi.fn().mockResolvedValue({
				name: "getStockPriceHistory",
				result: {},
			});

			// Always return function calls (new Response for each call)
			const fetchSpy = vi.spyOn(global, "fetch");
			for (let i = 0; i < 6; i++) {
				fetchSpy.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							makeFunctionCallResponse([
								{
									name: "getStockPriceHistory",
									args: {},
								},
							]),
						),
						{ status: 200 },
					),
				);
			}

			await expect(
				provider.generateTextWithMetadata("Analyze", {
					tools: toolDefs,
					toolHandler,
				}),
			).rejects.toThrow("Max tool call rounds");
		});

		it("should make a final structured call when tools + responseSchema are both provided", async () => {
			const toolHandler: ToolHandler = vi.fn().mockResolvedValue({
				name: "getStockPriceHistory",
				result: { startPrice: 150 },
			});

			const schema = v.object({ ticker: v.string(), summary: v.string() });

			// Mock responses for each API call
			const responses: Response[] = [];
			for (let i = 0; i < 10; i++) {
				responses.push(
					new Response(
						JSON.stringify(
							makeTextResponse('{"ticker":"AAPL","summary":"Price went up"}'),
						),
						{ status: 200 },
					),
				);
			}

			const fetchSpy = vi
				.spyOn(global, "fetch")
				// Call 1: model returns function call
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify(
							makeFunctionCallResponse([
								{
									name: "getStockPriceHistory",
									args: { ticker: "AAPL" },
								},
							]),
						),
						{ status: 200 },
					),
				);
			// Remaining calls: model returns text
			for (const r of responses) {
				fetchSpy.mockResolvedValueOnce(r);
			}

			const result = await provider.generateTextWithMetadata("Analyze", {
				tools: toolDefs,
				toolHandler,
				responseSchema: schema,
			});

			// Last call should be the final structured call with responseMimeType and no tools
			const lastIdx = fetchSpy.mock.calls.length - 1;
			const finalBody = JSON.parse(
				fetchSpy.mock.calls[lastIdx][1]?.body as string,
			);
			expect(finalBody.generationConfig.responseMimeType).toBe(
				"application/json",
			);
			expect(finalBody.tools).toBeUndefined();

			// The final structured call should have the full conversation
			expect(finalBody.contents.length).toBeGreaterThanOrEqual(3);

			// Should return the structured JSON
			expect(result.text).toBe('{"ticker":"AAPL","summary":"Price went up"}');
		});

		it("should throw when function call received but no toolHandler provided", async () => {
			vi.spyOn(global, "fetch").mockResolvedValueOnce(
				new Response(
					JSON.stringify(
						makeFunctionCallResponse([
							{
								name: "getStockPriceHistory",
								args: {},
							},
						]),
					),
					{ status: 200 },
				),
			);

			await expect(
				provider.generateTextWithMetadata("Analyze", {
					tools: toolDefs,
				}),
			).rejects.toThrow("no toolHandler was provided");
		});
	});
});
