import type { Todo } from "../../domain/Todo";

export interface UpdateTodoUseCase {
	execute(params: UpdateTodoInput): Promise<UpdateTodoOutput>;
}

export type UpdateTodoInput = {
	userId: string;
	id: string;
	title?: string;
	description?: string;
	completed?: boolean;
};

export type UpdateTodoOutput = {
	todo: Todo;
};
