import { api } from '$lib/common/api';
import type { ErrorResponse } from '$lib/common/types';
import { err, ok, type Result } from 'neverthrow';

export async function createCheckout(
	plan: 'starter' | 'pro',
	successUrl: string,
	cancelUrl: string
): Promise<Result<{ url: string }, ErrorResponse>> {
	try {
		const response = await api.post('/api/billing/checkout', { plan, successUrl, cancelUrl });
		const data = await response.json();
		if (!response.ok) return err(data as ErrorResponse);
		return ok(data as { url: string });
	} catch (error) {
		return err({ error: String(error), type: 'NetworkError' });
	}
}
