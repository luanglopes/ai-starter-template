import type { EmailProvider } from "../../app/providers/EmailProvider";

export class ConsoleEmailProvider implements EmailProvider {
	async sendVerificationOTP(input: {
		email: string;
		otp: string;
	}): Promise<void> {
		console.log(
			`[console-email] verification OTP for ${input.email}: ${input.otp}`,
		);
	}

	async sendPasswordResetOTP(input: {
		email: string;
		otp: string;
	}): Promise<void> {
		console.log(
			`[console-email] password reset OTP for ${input.email}: ${input.otp}`,
		);
	}
}
