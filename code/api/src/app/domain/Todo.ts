export type Todo = {
	id: string;
	userId: string;
	title: string;
	description?: string;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateTodoInput = {
	userId: string;
	title: string;
	description?: string;
};

export type UpdateTodoInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	completed?: boolean;
};
