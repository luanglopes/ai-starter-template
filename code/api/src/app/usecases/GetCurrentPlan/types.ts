import type { Plan } from "../../domain/Billing";

export interface GetCurrentPlanUseCase {
	execute(params: GetCurrentPlanInput): Promise<GetCurrentPlanOutput>;
}

export type GetCurrentPlanInput = { userId: string };

export type GetCurrentPlanOutput = { plan: Plan };
