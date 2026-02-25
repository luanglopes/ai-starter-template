import { api } from '$lib/common/api';
import type { ErrorResponse } from '$lib/common/types';
import type { Todo } from '$lib/todos/dtos/Todo';
import { err, ok, type Result } from 'neverthrow';

export async function listTodos(params?: {
	limit?: number;
	offset?: number;
}): Promise<
	Result<{ todos: Todo[]; total: number; limit: number; offset: number }, ErrorResponse>
> {
	try {
		const response = await api.get('/api/todos', params);
		const data = await response.json();
		if (!response.ok) return err(data as ErrorResponse);
		return ok(data as { todos: Todo[]; total: number; limit: number; offset: number });
	} catch (error) {
		return err({ error: String(error), type: 'NetworkError' });
	}
}
