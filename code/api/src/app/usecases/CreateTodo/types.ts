import type { Todo } from "../../domain/Todo";

export interface CreateTodoUseCase {
	execute(params: CreateTodoInput): Promise<CreateTodoOutput>;
}

export type CreateTodoInput = {
	userId: string;
	title: string;
	description?: string;
};

export type CreateTodoOutput = {
	todo: Todo;
};
