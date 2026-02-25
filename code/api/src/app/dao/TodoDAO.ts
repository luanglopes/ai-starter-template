import type { CreateTodoInput, Todo, UpdateTodoInput } from "../domain/Todo";

export interface TodoDAO {
	listByUserId(params: {
		userId: string;
		limit: number;
		offset: number;
	}): Promise<{ todos: Todo[]; total: number }>;
	getById(params: { id: string; userId: string }): Promise<Todo | null>;
	create(input: CreateTodoInput): Promise<Todo>;
	update(input: UpdateTodoInput): Promise<Todo | null>;
	delete(params: { id: string; userId: string }): Promise<void>;
}
