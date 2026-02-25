import { api } from '$lib/common/api';
import type { ErrorResponse } from '$lib/common/types';
import { err, ok, type Result } from 'neverthrow';

export async function deleteAccount(): Promise<Result<{ success: boolean }, ErrorResponse>> {
	try {
		const response = await api.delete('/api/account');
		const data = await response.json();
		if (!response.ok) return err(data as ErrorResponse);
		return ok(data as { success: boolean });
	} catch (error) {
		return err({ error: String(error), type: 'NetworkError' });
	}
}
