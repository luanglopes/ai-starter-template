import { api } from '$lib/common/api';
import type { ErrorResponse } from '$lib/common/types';
import type { Todo } from '$lib/todos/dtos/Todo';
import { err, ok, type Result } from 'neverthrow';

export async function enhanceTodoDescription(
	id: string
): Promise<Result<{ todo: Todo; usedThisMonth: number; limit: number }, ErrorResponse>> {
	try {
		const response = await api.post(`/api/todos/${id}/enhance-description`, {});
		const data = await response.json();
		if (!response.ok) return err(data as ErrorResponse);
		return ok(data as { todo: Todo; usedThisMonth: number; limit: number });
	} catch (error) {
		return err({ error: String(error), type: 'NetworkError' });
	}
}
