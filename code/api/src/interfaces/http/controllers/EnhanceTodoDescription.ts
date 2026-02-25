import * as v from "valibot";
import type { EnhanceTodoDescriptionUseCase } from "../../../app/usecases/EnhanceTodoDescription";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class EnhanceTodoDescriptionController {
	static readonly path = "/todos/:id/enhance-description";
	static readonly schema = {
		param: v.object({
			id: v.string(),
		}),
	};

	constructor(private useCase: EnhanceTodoDescriptionUseCase) {}

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
	typeof EnhanceTodoDescriptionController.path,
	typeof EnhanceTodoDescriptionController.schema
>;
