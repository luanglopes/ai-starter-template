export interface AuthProvider {
	removeUser(userId: string): Promise<void>;
}
