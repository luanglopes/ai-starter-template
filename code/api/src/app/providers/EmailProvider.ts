export interface EmailProvider {
	sendVerificationOTP(input: { email: string; otp: string }): Promise<void>;
	sendPasswordResetOTP(input: { email: string; otp: string }): Promise<void>;
}
