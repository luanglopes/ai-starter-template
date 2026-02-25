import * as v from "valibot";
import type { ListTodosUseCase } from "../../../app/usecases/ListTodos";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

const toNumber = (input: string | undefined): number | undefined => {
	if (input === undefined) return undefined;
	const n = Number(input);
	return Number.isNaN(n) ? undefined : n;
};

export class ListTodosController {
	static readonly path = "/todos";
	static readonly schema = {
		query: v.object({
			limit: v.optional(v.string()),
			offset: v.optional(v.string()),
		}),
	};

	constructor(private useCase: ListTodosUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const query = ctx.req.valid("query");
			const result = await this.useCase.execute({
				userId: session.user.id,
				limit: toNumber(query.limit),
				offset: toNumber(query.offset),
			});
			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof ListTodosController.path,
	typeof ListTodosController.schema
>;
