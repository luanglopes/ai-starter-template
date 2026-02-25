import type { TodoDAO } from "../../dao/TodoDAO";
import type {
	ListTodosInput,
	ListTodosOutput,
	ListTodosUseCase,
} from "./types";

export class ListTodos implements ListTodosUseCase {
	constructor(private todoDAO: TodoDAO) {}

	async execute(params: ListTodosInput): Promise<ListTodosOutput> {
		const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
		const offset = Math.max(params.offset ?? 0, 0);
		const { todos, total } = await this.todoDAO.listByUserId({
			userId: params.userId,
			limit,
			offset,
		});

		return { todos, total, limit, offset };
	}
}
