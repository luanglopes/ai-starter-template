export type CustomerPlan = {
	productId: string;
};

export interface EntitlementProvider {
	getCustomerPlan(customerId: string): Promise<CustomerPlan>;

	checkout(input: {
		customerId: string;
		productId: string;
		successUrl: string;
	}): Promise<{ url?: string }>;

	portal(input: { customerId: string }): Promise<{ url: string }>;

	createCustomer(input: {
		id: string;
		email: string;
		name?: string;
	}): Promise<void>;
}
