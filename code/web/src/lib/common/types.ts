export type PlanLimitMetadata = {
	limitType: string;
	plan: 'free' | 'starter' | 'pro';
	used: number;
	limit: number;
};

type ConcurrencyLimitMetadata = {
	limitType: string;
	plan: 'free' | 'starter' | 'pro';
	active: number;
	limit: number;
};

export type ErrorResponse = {
	error: string;
	type: string;
	metadata?: PlanLimitMetadata | ConcurrencyLimitMetadata;
};
