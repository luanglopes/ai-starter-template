import { api } from '$lib/common/api';
import type { ErrorResponse } from '$lib/common/types';
import { err, ok, type Result } from 'neverthrow';

export async function deleteTodo(id: string): Promise<Result<{ success: true }, ErrorResponse>> {
	try {
		const response = await api.delete(`/api/todos/${id}`);
		const data = await response.json();
		if (!response.ok) return err(data as ErrorResponse);
		return ok(data as { success: true });
	} catch (error) {
		return err({ error: String(error), type: 'NetworkError' });
	}
}
