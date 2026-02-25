import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest";
import type { AuthProvider } from "../../providers/AuthProvider";
import { DeleteAccount } from "./DeleteAccount";

describe("DeleteAccount", () => {
	let useCase: DeleteAccount;
	let mockAuthProvider: Mocked<AuthProvider>;

	beforeEach(() => {
		mockAuthProvider = {
			removeUser: vi.fn().mockResolvedValue(undefined),
		};
		useCase = new DeleteAccount(mockAuthProvider);
	});

	it("deletes the user account", async () => {
		const result = await useCase.execute({ userId: "user-1" });

		expect(result).toEqual({ success: true });
		expect(mockAuthProvider.removeUser).toHaveBeenCalledWith("user-1");
	});

	it("propagates error if removeUser fails", async () => {
		mockAuthProvider.removeUser.mockRejectedValue(
			new Error("Auth delete failed"),
		);

		await expect(useCase.execute({ userId: "user-1" })).rejects.toThrow(
			"Auth delete failed",
		);
	});
});
