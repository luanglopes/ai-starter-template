export interface DeleteTodoUseCase {
	execute(params: DeleteTodoInput): Promise<DeleteTodoOutput>;
}

export type DeleteTodoInput = {
	userId: string;
	id: string;
};

export type DeleteTodoOutput = {
	success: true;
};
