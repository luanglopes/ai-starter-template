import type { Plan } from "../../domain/Billing";

export function toPlan(productId: string): Plan {
	if (productId.includes("pro")) return "pro";
	if (productId.includes("starter")) return "starter";
	return "free";
}
