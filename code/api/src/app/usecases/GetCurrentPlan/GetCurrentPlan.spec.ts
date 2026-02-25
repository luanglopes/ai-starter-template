import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";
import type { EntitlementProvider } from "../../providers/EntitlementProvider";
import { GetCurrentPlan } from "./GetCurrentPlan";

describe("GetCurrentPlan", () => {
	let useCase: GetCurrentPlan;
	let mockEntitlementProvider: Mocked<EntitlementProvider>;

	beforeEach(() => {
		mockEntitlementProvider = {
			getCustomerPlan: vi.fn(),
			checkout: vi.fn(),
			portal: vi.fn(),
			createCustomer: vi.fn(),
		};
		useCase = new GetCurrentPlan(mockEntitlementProvider);
	});

	it("returns free plan when no product subscription", async () => {
		mockEntitlementProvider.getCustomerPlan.mockResolvedValue({
			productId: "",
		});

		const result = await useCase.execute({ userId: "user-1" });

		expect(mockEntitlementProvider.getCustomerPlan).toHaveBeenCalledWith(
			"user-1",
		);
		expect(result.plan).toBe("free");
	});

	it("returns starter plan for starter product", async () => {
		mockEntitlementProvider.getCustomerPlan.mockResolvedValue({
			productId: "starter_monthly",
		});

		const result = await useCase.execute({ userId: "user-1" });

		expect(result.plan).toBe("starter");
	});

	it("returns pro plan for pro product", async () => {
		mockEntitlementProvider.getCustomerPlan.mockResolvedValue({
			productId: "pro_monthly",
		});

		const result = await useCase.execute({ userId: "user-1" });

		expect(result.plan).toBe("pro");
	});
});
