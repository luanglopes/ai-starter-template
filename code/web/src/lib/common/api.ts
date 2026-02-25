import { PUBLIC_API_BASE_URL } from '$env/static/public';

function makeRequest(method: string, url: string, body?: unknown, options?: RequestInit) {
	const config: RequestInit = {
		method,
		credentials: 'include',
		...options
	};

	const fullUrl = url.startsWith('http') ? url : `${PUBLIC_API_BASE_URL || ''}${url}`;

	if (body) {
		if (body instanceof FormData) {
			config.body = body;
			config.headers = {
				...(options?.headers || {})
			};
		} else {
			config.body = JSON.stringify(body);
			config.headers = {
				'Content-Type': 'application/json',
				...(options?.headers || {})
			};
		}
	}

	return fetch(fullUrl, config);
}

export const api = {
	get: <P = unknown>(url: string, params?: P, options?: RequestInit) => {
		let urlWithParams = url;
		if (params) {
			const queryString = new URLSearchParams(toSearchSerializableParams(params)).toString();
			urlWithParams += `?${queryString}`;
		}
		return makeRequest('GET', urlWithParams, undefined, options);
	},
	post: (url: string, body: unknown, options?: RequestInit) =>
		makeRequest('POST', url, body, options),
	patch: (url: string, body: unknown, options?: RequestInit) =>
		makeRequest('PATCH', url, body, options),
	delete: (url: string, options?: RequestInit) => makeRequest('DELETE', url, undefined, options)
};

function toSearchSerializableParams(obj: unknown): QueryParams {
	if (obj instanceof URLSearchParams) return obj;
	if (typeof obj === 'object' && obj !== null) {
		const params: Record<string, string> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (value !== undefined && value !== null) {
				params[key] = String(value);
			}
		}
		return params;
	}
	if (obj === null || obj === undefined) return {};
	if (typeof obj === 'string') return obj;
	if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
	throw new Error('Unsupported type for search params');
}

type QueryParams = ConstructorParameters<typeof URLSearchParams>[0];
