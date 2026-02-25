import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";
import { ValidationError } from "../../domain/errors";
import type { EntitlementProvider } from "../../providers/EntitlementProvider";
import { CreateBillingCheckout } from "./CreateBillingCheckout";

describe("CreateBillingCheckout", () => {
	let useCase: CreateBillingCheckout;
	let mockEntitlementProvider: Mocked<EntitlementProvider>;

	beforeEach(() => {
		mockEntitlementProvider = {
			getCustomerPlan: vi.fn(),
			checkout: vi.fn(),
			portal: vi.fn(),
			createCustomer: vi.fn(),
		};
		useCase = new CreateBillingCheckout(mockEntitlementProvider);
	});

	it("creates checkout session with pro plan", async () => {
		mockEntitlementProvider.checkout.mockResolvedValue({
			url: "https://billing/checkout",
		});

		const result = await useCase.execute({
			userId: "user-1",
			email: "user@example.com",
			plan: "pro",
			successUrl: "https://app/success",
			cancelUrl: "https://app/cancel",
		});

		expect(mockEntitlementProvider.checkout).toHaveBeenCalledWith({
			customerId: "user-1",
			productId: "pro",
			successUrl: "https://app/success",
		});
		expect(result.url).toBe("https://billing/checkout");
	});

	it("creates checkout session with starter plan", async () => {
		mockEntitlementProvider.checkout.mockResolvedValue({
			url: "https://billing/checkout-starter",
		});

		const result = await useCase.execute({
			userId: "user-1",
			email: "user@example.com",
			plan: "starter",
			successUrl: "https://app/success",
			cancelUrl: "https://app/cancel",
		});

		expect(mockEntitlementProvider.checkout).toHaveBeenCalledWith({
			customerId: "user-1",
			productId: "starter",
			successUrl: "https://app/success",
		});
		expect(result.url).toBe("https://billing/checkout-starter");
	});

	it("throws ValidationError when checkout URL is not returned", async () => {
		mockEntitlementProvider.checkout.mockResolvedValue({ url: undefined });

		await expect(
			useCase.execute({
				userId: "user-1",
				email: "user@example.com",
				plan: "pro",
				successUrl: "https://app/success",
				cancelUrl: "https://app/cancel",
			}),
		).rejects.toThrow(ValidationError);
	});
});
