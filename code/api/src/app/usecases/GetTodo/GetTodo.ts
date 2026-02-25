import type { TodoDAO } from "../../dao/TodoDAO";
import { NotFoundError } from "../../domain/errors";
import type { GetTodoInput, GetTodoOutput, GetTodoUseCase } from "./types";

export class GetTodo implements GetTodoUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: GetTodoInput): Promise<GetTodoOutput> {
		const todo = await this.todoDAO.getById({
			id: params.id,
			userId: params.userId,
		});

		if (!todo) {
			throw new NotFoundError("Todo not found");
		}

		return { todo };
	}
}
