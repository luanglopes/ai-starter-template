import type { Autumn } from "autumn-js";
import type {
	CustomerPlan,
	EntitlementProvider,
} from "../../app/providers/EntitlementProvider";

export class AutumnEntitlementProvider implements EntitlementProvider {
	constructor(private autumn: Autumn) {}

	async getCustomerPlan(customerId: string): Promise<CustomerPlan> {
		const { data, error } = await this.autumn.customers.get(customerId);

		if (error || !data) {
			return { productId: "free" };
		}

		const products = (data as unknown as Record<string, unknown>).products;
		if (Array.isArray(products) && products.length > 0) {
			const activeProduct = products.find(
				(p: Record<string, unknown>) => p.status === "active",
			);
			if (activeProduct) {
				return { productId: String(activeProduct.id ?? "free") };
			}
		}

		return { productId: "free" };
	}

	async checkout(input: {
		customerId: string;
		productId: string;
		successUrl: string;
	}): Promise<{ url?: string }> {
		const { data, error } = await this.autumn.checkout({
			customer_id: input.customerId,
			product_id: input.productId,
			success_url: input.successUrl,
		});

		if (error) {
			throw new Error(`Failed to create checkout: ${String(error)}`);
		}

		return { url: data?.url };
	}

	async portal(input: { customerId: string }): Promise<{ url: string }> {
		const { data, error } = await this.autumn.customers.billingPortal(
			input.customerId,
		);

		if (error || !data) {
			throw new Error(`Failed to get billing portal: ${String(error)}`);
		}

		return { url: data.url };
	}

	async createCustomer(input: {
		id: string;
		email: string;
		name?: string;
	}): Promise<void> {
		const { error } = await this.autumn.customers.create({
			id: input.id,
			email: input.email,
			name: input.name ?? undefined,
		});

		if (error) {
			console.error(
				`Failed to create Autumn customer ${input.id}: ${String(error)}`,
			);
		}
	}
}
