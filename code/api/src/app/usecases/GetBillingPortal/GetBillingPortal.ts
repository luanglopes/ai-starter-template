import type { EntitlementProvider } from "../../providers/EntitlementProvider";
import type {
	GetBillingPortalInput,
	GetBillingPortalOutput,
	GetBillingPortalUseCase,
} from "./types";

export class GetBillingPortal implements GetBillingPortalUseCase {
	constructor(private entitlementProvider: EntitlementProvider) {}

	async execute(
		params: GetBillingPortalInput,
	): Promise<GetBillingPortalOutput> {
		return this.entitlementProvider.portal({ customerId: params.userId });
	}
}
