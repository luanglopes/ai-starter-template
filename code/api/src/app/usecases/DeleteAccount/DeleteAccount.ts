import type { AuthProvider } from "../../providers/AuthProvider";
import type {
	DeleteAccountInput,
	DeleteAccountOutput,
	DeleteAccountUseCase,
} from "./types";

export class DeleteAccount implements DeleteAccountUseCase {
	constructor(private authProvider: AuthProvider) {}

	async execute(params: DeleteAccountInput): Promise<DeleteAccountOutput> {
		await this.authProvider.removeUser(params.userId);

		return { success: true };
	}
}
