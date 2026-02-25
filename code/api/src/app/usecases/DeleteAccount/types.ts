export interface DeleteAccountUseCase {
	execute(params: DeleteAccountInput): Promise<DeleteAccountOutput>;
}

export type DeleteAccountInput = {
	userId: string;
};

export type DeleteAccountOutput = { success: true };
