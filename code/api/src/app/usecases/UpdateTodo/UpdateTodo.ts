import type { TodoDAO } from "../../dao/TodoDAO";
import { NotFoundError, ValidationError } from "../../domain/errors";
import type {
	UpdateTodoInput,
	UpdateTodoOutput,
	UpdateTodoUseCase,
} from "./types";

export class UpdateTodo implements UpdateTodoUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: UpdateTodoInput): Promise<UpdateTodoOutput> {
		if (
			params.title === undefined &&
			params.description === undefined &&
			params.completed === undefined
		) {
			throw new ValidationError("No fields provided to update");
		}

		const title = params.title?.trim();
		if (params.title !== undefined && (!title || title.length === 0)) {
			throw new ValidationError("Title should not be empty");
		}

		const description =
			params.description === undefined
				? undefined
				: params.description.trim() || undefined;

		const todo = await this.todoDAO.update({
			id: params.id,
			userId: params.userId,
			title,
			description,
			completed: params.completed,
		});

		if (!todo) {
			throw new NotFoundError("Todo not found");
		}

		return { todo };
	}
}
