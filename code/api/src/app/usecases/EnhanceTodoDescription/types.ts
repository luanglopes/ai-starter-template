import type { Todo } from "../../domain/Todo";

export interface EnhanceTodoDescriptionUseCase {
	execute(
		params: EnhanceTodoDescriptionInput,
	): Promise<EnhanceTodoDescriptionOutput>;
}

export type EnhanceTodoDescriptionInput = {
	userId: string;
	id: string;
};

export type EnhanceTodoDescriptionOutput = {
	todo: Todo;
	usedThisMonth: number;
	limit: number;
};
