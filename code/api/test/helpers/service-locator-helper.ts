import { ServiceLocator } from "../../src/infra/ServiceLocator";

/**
 * Clear all test mocks after tests
 */
export function clearAllTestMocks(): void {
	ServiceLocator.clear();
}
