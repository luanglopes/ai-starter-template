import type { TodoDAO } from "../../dao/TodoDAO";
import { ValidationError } from "../../domain/errors";
import type {
	CreateTodoInput,
	CreateTodoOutput,
	CreateTodoUseCase,
} from "./types";

export class CreateTodo implements CreateTodoUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: CreateTodoInput): Promise<CreateTodoOutput> {
		const title = params.title.trim();
		if (title.length === 0) {
			throw new ValidationError("Title should not be empty");
		}

		const description = params.description?.trim();
		const todo = await this.todoDAO.create({
			userId: params.userId,
			title,
			description:
				description && description.length > 0 ? description : undefined,
		});

		return { todo };
	}
}
