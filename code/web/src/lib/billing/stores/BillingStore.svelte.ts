import { getCurrentPlan } from '$lib/billing/services/getCurrentPlan';

export type PlanInfo = {
	name: string;
	key: 'free' | 'starter' | 'pro';
	price: string;
};

export const PLAN_DATA: Record<'free' | 'starter' | 'pro', PlanInfo> = {
	free: {
		name: 'Free',
		key: 'free',
		price: '$0/mo'
	},
	starter: {
		name: 'Starter',
		key: 'starter',
		price: '$19/mo'
	},
	pro: {
		name: 'Pro',
		key: 'pro',
		price: '$49/mo'
	}
};

export class BillingStore {
	plan = $state<'free' | 'starter' | 'pro'>('free');
	loading = $state(true);

	planInfo: PlanInfo = $derived(PLAN_DATA[this.plan]);
	isPaidPlan = $derived(this.plan !== 'free');

	async load() {
		const result = await getCurrentPlan();
		if (result.isOk()) {
			this.plan = result.value.plan;
		}
		this.loading = false;
	}
}

let billingStore: BillingStore;

export function getBillingStore() {
	if (!billingStore) {
		billingStore = new BillingStore();
	}
	return billingStore;
}
