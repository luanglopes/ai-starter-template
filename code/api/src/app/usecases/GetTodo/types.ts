import type { Todo } from "../../domain/Todo";

export interface GetTodoUseCase {
	execute(params: GetTodoInput): Promise<GetTodoOutput>;
}

export type GetTodoInput = {
	userId: string;
	id: string;
};

export type GetTodoOutput = {
	todo: Todo;
};
