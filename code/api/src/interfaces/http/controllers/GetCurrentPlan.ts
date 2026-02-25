import type { GetCurrentPlanUseCase } from "../../../app/usecases/GetCurrentPlan";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class GetCurrentPlanController {
	static readonly path = "/billing/plan";
	static readonly schema = {};

	constructor(private useCase: GetCurrentPlanUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const result = await this.useCase.execute({ userId: session.user.id });
			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof GetCurrentPlanController.path,
	typeof GetCurrentPlanController.schema
>;
