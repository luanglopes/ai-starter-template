import { api } from '$lib/common/api';
import type { ErrorResponse } from '$lib/common/types';
import { err, ok, type Result } from 'neverthrow';

export async function getCurrentPlan(): Promise<
	Result<{ plan: 'free' | 'starter' | 'pro' }, ErrorResponse>
> {
	try {
		const response = await api.get('/api/billing/plan');
		const data = await response.json();
		if (!response.ok) return err(data as ErrorResponse);
		return ok(data as { plan: 'free' | 'starter' | 'pro' });
	} catch (error) {
		return err({ error: String(error), type: 'NetworkError' });
	}
}
