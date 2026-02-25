import { ValidationError } from "../../domain/errors";
import type { EntitlementProvider } from "../../providers/EntitlementProvider";
import type {
	CreateBillingCheckoutInput,
	CreateBillingCheckoutOutput,
	CreateBillingCheckoutUseCase,
} from "./types";

export class CreateBillingCheckout implements CreateBillingCheckoutUseCase {
	constructor(private entitlementProvider: EntitlementProvider) {}

	async execute(
		params: CreateBillingCheckoutInput,
	): Promise<CreateBillingCheckoutOutput> {
		const result = await this.entitlementProvider.checkout({
			customerId: params.userId,
			productId: params.plan,
			successUrl: params.successUrl,
		});

		if (!result.url) {
			throw new ValidationError("Failed to create checkout URL");
		}

		return { url: result.url };
	}
}
