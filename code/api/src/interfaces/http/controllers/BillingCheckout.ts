import * as v from "valibot";
import type { CreateBillingCheckoutUseCase } from "../../../app/usecases/CreateBillingCheckout";
import { getSession } from "../../../infra/better-auth/getSession";
import type { AppContext } from "../AppContext";
import { createErrorResponse } from "../utils/errorHandler";
import { createJsonResponse } from "../utils/response";

export class BillingCheckoutController {
	static readonly path = "/billing/checkout";
	static readonly schema = {
		json: v.object({
			plan: v.picklist(["starter", "pro"]),
			successUrl: v.string(),
			cancelUrl: v.string(),
		}),
	};

	constructor(private useCase: CreateBillingCheckoutUseCase) {}

	async handle(ctx: ReqContext): Promise<Response> {
		try {
			const session = await getSession(ctx);
			const payload = ctx.req.valid("json");
			const result = await this.useCase.execute({
				userId: session.user.id,
				email: session.user.email ?? "",
				plan: payload.plan,
				successUrl: payload.successUrl,
				cancelUrl: payload.cancelUrl,
			});
			return createJsonResponse(result);
		} catch (error) {
			return createErrorResponse(ctx, error as Error);
		}
	}
}

type ReqContext = AppContext<
	typeof BillingCheckoutController.path,
	typeof BillingCheckoutController.schema
>;
