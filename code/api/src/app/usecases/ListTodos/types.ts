import type { Todo } from "../../domain/Todo";

export interface ListTodosUseCase {
	execute(params: ListTodosInput): Promise<ListTodosOutput>;
}

export type ListTodosInput = {
	userId: string;
	limit?: number;
	offset?: number;
};

export type ListTodosOutput = {
	todos: Todo[];
	total: number;
	limit: number;
	offset: number;
};
