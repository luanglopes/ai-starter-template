import { api } from '$lib/common/api';
import type { ErrorResponse } from '$lib/common/types';
import type { Todo } from '$lib/todos/dtos/Todo';
import { err, ok, type Result } from 'neverthrow';

export async function createTodo(input: {
	title: string;
	description?: string;
}): Promise<Result<{ todo: Todo }, ErrorResponse>> {
	try {
		const response = await api.post('/api/todos', input);
		const data = await response.json();
		if (!response.ok) return err(data as ErrorResponse);
		return ok(data as { todo: Todo });
	} catch (error) {
		return err({ error: String(error), type: 'NetworkError' });
	}
}
