export interface CreateBillingCheckoutUseCase {
	execute(
		params: CreateBillingCheckoutInput,
	): Promise<CreateBillingCheckoutOutput>;
}

export type CreateBillingCheckoutInput = {
	userId: string;
	email: string;
	plan: "starter" | "pro";
	successUrl: string;
	cancelUrl: string;
};

export type CreateBillingCheckoutOutput = { url: string };
