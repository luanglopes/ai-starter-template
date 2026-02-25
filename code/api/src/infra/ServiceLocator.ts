import type { AICallLogDAO } from "../app/dao/AICallLogDAO";
import type { TodoDAO } from "../app/dao/TodoDAO";
import type { AIProvider } from "../app/providers/AIProvider";
import type { EmailProvider } from "../app/providers/EmailProvider";
import type { EntitlementProvider } from "../app/providers/EntitlementProvider";

/**
 * Central registry mapping service keys to their types
 * Add new services here to get type safety everywhere
 */
export interface ServiceRegistry {
	// External providers (commonly mocked in tests)
	aiProvider: AIProvider;
	entitlementProvider: EntitlementProvider;
	emailProvider: EmailProvider;

	// DAOs (optional mocking for unit tests)
	aiCallLogDAO: AICallLogDAO;
	todoDAO: TodoDAO;
}

const instances = new Map<
	keyof ServiceRegistry,
	ServiceRegistry[keyof ServiceRegistry]
>();

export const ServiceLocator = {
	register<K extends keyof ServiceRegistry>(
		key: K,
		instance: ServiceRegistry[K],
	): void {
		instances.set(key, instance);
	},

	get<K extends keyof ServiceRegistry>(key: K): ServiceRegistry[K] | undefined {
		return instances.get(key) as ServiceRegistry[K] | undefined;
	},

	clear(): void {
		instances.clear();
	},
};
