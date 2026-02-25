export interface GetBillingPortalUseCase {
	execute(params: GetBillingPortalInput): Promise<GetBillingPortalOutput>;
}

export type GetBillingPortalInput = { userId: string };

export type GetBillingPortalOutput = { url: string };
