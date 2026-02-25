import * as v from "valibot";
import type { DeleteTodoUseCase } from "../../../app/usecases/DeleteTodo";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class DeleteTodoController {
	static readonly path = "/todos/:id";
	static readonly schema = {
		param: v.object({
			id: v.string(),
		}),
	};

	constructor(private useCase: DeleteTodoUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const { id } = ctx.req.valid("param");
			const result = await this.useCase.execute({
				userId: session.user.id,
				id,
			});
			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof DeleteTodoController.path,
	typeof DeleteTodoController.schema
>;
