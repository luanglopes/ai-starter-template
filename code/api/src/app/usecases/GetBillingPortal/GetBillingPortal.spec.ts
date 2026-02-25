import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";
import type { EntitlementProvider } from "../../providers/EntitlementProvider";
import { GetBillingPortal } from "./GetBillingPortal";

describe("GetBillingPortal", () => {
	let useCase: GetBillingPortal;
	let mockEntitlementProvider: Mocked<EntitlementProvider>;

	beforeEach(() => {
		mockEntitlementProvider = {
			getCustomerPlan: vi.fn(),
			checkout: vi.fn(),
			portal: vi.fn(),
			createCustomer: vi.fn(),
		};
		useCase = new GetBillingPortal(mockEntitlementProvider);
	});

	it("creates billing portal session", async () => {
		mockEntitlementProvider.portal.mockResolvedValue({
			url: "https://billing/portal",
		});

		const result = await useCase.execute({ userId: "user-1" });

		expect(mockEntitlementProvider.portal).toHaveBeenCalledWith({
			customerId: "user-1",
		});
		expect(result.url).toBe("https://billing/portal");
	});
});
