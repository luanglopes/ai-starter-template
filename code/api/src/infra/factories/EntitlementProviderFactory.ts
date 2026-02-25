import type { EntitlementProvider } from "../../app/providers/EntitlementProvider";
import { createAutumnClient } from "../autumn/AutumnClient";
import { AutumnEntitlementProvider } from "../autumn/AutumnEntitlementProvider";
import { ServiceLocator } from "../ServiceLocator";

export function getEntitlementProvider(env: Env): EntitlementProvider {
	const mock = ServiceLocator.get("entitlementProvider");
	if (mock) return mock;

	const autumn = createAutumnClient(env);
	return new AutumnEntitlementProvider(autumn);
}
