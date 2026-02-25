import * as v from "valibot";
import type { CreateTodoUseCase } from "../../../app/usecases/CreateTodo";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class CreateTodoController {
	static readonly path = "/todos";
	static readonly schema = {
		json: v.object({
			title: v.string(),
			description: v.optional(v.string()),
		}),
	};

	constructor(private useCase: CreateTodoUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const payload = ctx.req.valid("json");
			const result = await this.useCase.execute({
				userId: session.user.id,
				title: payload.title,
				description: payload.description,
			});
			return createJsonResponse(result, 201);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof CreateTodoController.path,
	typeof CreateTodoController.schema
>;
