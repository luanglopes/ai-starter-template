import type { TodoDAO } from "../../dao/TodoDAO";
import { NotFoundError } from "../../domain/errors";
import type {
	DeleteTodoInput,
	DeleteTodoOutput,
	DeleteTodoUseCase,
} from "./types";

export class DeleteTodo implements DeleteTodoUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: DeleteTodoInput): Promise<DeleteTodoOutput> {
		const existing = await this.todoDAO.getById({
			id: params.id,
			userId: params.userId,
		});

		if (!existing) {
			throw new NotFoundError("Todo not found");
		}

		await this.todoDAO.delete({ id: params.id, userId: params.userId });
		return { success: true };
	}
}
