import * as v from "valibot";
import type { UpdateTodoUseCase } from "../../../app/usecases/UpdateTodo";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class UpdateTodoController {
	static readonly path = "/todos/:id";
	static readonly schema = {
		param: v.object({
			id: v.string(),
		}),
		json: v.object({
			title: v.optional(v.string()),
			description: v.optional(v.string()),
			completed: v.optional(v.boolean()),
		}),
	};

	constructor(private useCase: UpdateTodoUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const { id } = ctx.req.valid("param");
			const payload = ctx.req.valid("json");
			const result = await this.useCase.execute({
				userId: session.user.id,
				id,
				title: payload.title,
				description: payload.description,
				completed: payload.completed,
			});
			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof UpdateTodoController.path,
	typeof UpdateTodoController.schema
>;
