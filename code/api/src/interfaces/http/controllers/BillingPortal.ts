import type { GetBillingPortalUseCase } from "../../../app/usecases/GetBillingPortal";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class BillingPortalController {
	static readonly path = "/billing/portal";
	static readonly schema = {};

	constructor(private useCase: GetBillingPortalUseCase) {}

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
	typeof BillingPortalController.path,
	typeof BillingPortalController.schema
>;
