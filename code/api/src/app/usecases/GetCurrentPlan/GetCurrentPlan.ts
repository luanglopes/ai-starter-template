import type { EntitlementProvider } from "../../providers/EntitlementProvider";
import { toPlan } from "../common/entitlements";
import type {
	GetCurrentPlanInput,
	GetCurrentPlanOutput,
	GetCurrentPlanUseCase,
} from "./types";

export class GetCurrentPlan implements GetCurrentPlanUseCase {
	constructor(private entitlementProvider: EntitlementProvider) {}

	async execute(params: GetCurrentPlanInput): Promise<GetCurrentPlanOutput> {
		const customerPlan = await this.entitlementProvider.getCustomerPlan(
			params.userId,
		);
		return { plan: toPlan(customerPlan.productId) };
	}
}
