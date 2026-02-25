export type RequestOptions = {
	body?: unknown;
	query?: Record<string, string>;
	headers?: Record<string, string>;
	userId?: string;
	env?: Env;
};

export type TestResponse<T = unknown> = {
	status: number;
	data: T;
	headers: Headers;
};

import { SELF } from "cloudflare:test";

/**
 * Make a test request to the Hono app
 */
export async function testRequest<T = unknown>(
	method: string,
	path: string,
	options: RequestOptions = {},
): Promise<TestResponse<T>> {
	// Build URL with query params
	let url = path;
	if (options.query) {
		const params = new URLSearchParams(options.query);
		url = `${path}?${params.toString()}`;
	}

	// Build request
	const requestInit: RequestInit = {
		method: method.toUpperCase(),
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	};

	// Add body for non-GET requests
	if (options.body && method.toUpperCase() !== "GET") {
		requestInit.body = JSON.stringify(options.body);
	}

	// Add user context header if provided
	if (options.userId) {
		requestInit.headers = {
			...requestInit.headers,
			"X-User-Id": options.userId, // Simplified auth for testing
		};
	}

	// Make request with environment
	const request = new Request(`http://localhost${url}`, requestInit);
	const response = await SELF.fetch(request);

	// Parse response
	let data: T;
	const contentType = response.headers.get("content-type");
	if (contentType?.includes("application/json")) {
		data = (await response.json()) as T;
	} else {
		data = (await response.text()) as T;
	}

	if (!response.ok) {
		console.error(`Request to ${url} failed with status ${response.status}:`, {
			error: JSON.stringify((data as any)?.error, null, 2),
			data,
		});
	}

	return {
		status: response.status,
		data,
		headers: response.headers,
	};
}

/**
 * Convenience methods for common HTTP verbs
 */
export const request = {
	get: <T = any>(path: string, options?: RequestOptions) =>
		testRequest<T>("GET", path, options),

	post: <T = any>(path: string, options?: RequestOptions) =>
		testRequest<T>("POST", path, options),

	patch: <T = any>(path: string, options?: RequestOptions) =>
		testRequest<T>("PATCH", path, options),

	put: <T = any>(path: string, options?: RequestOptions) =>
		testRequest<T>("PUT", path, options),

	delete: <T = any>(path: string, options?: RequestOptions) =>
		testRequest<T>("DELETE", path, options),
};
