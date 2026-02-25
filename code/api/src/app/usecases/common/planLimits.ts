export type PlanId = "free" | "starter" | "pro";

export const AI_ENHANCEMENT_LIMITS: Record<PlanId, number> = {
	free: 20,
	starter: 200,
	pro: 1000,
};

export function getAIEnhancementLimit(plan: string): number {
	return (
		AI_ENHANCEMENT_LIMITS[(plan as PlanId) ?? "free"] ??
		AI_ENHANCEMENT_LIMITS.free
	);
}
