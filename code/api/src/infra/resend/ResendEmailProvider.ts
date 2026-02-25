import { Resend } from "resend";
import type { EmailProvider } from "../../app/providers/EmailProvider";

export class ResendEmailProvider implements EmailProvider {
	private client: Resend;

	constructor(
		apiKey: string,
		private from: string,
	) {
		this.client = new Resend(apiKey);
	}

	async sendVerificationOTP(input: {
		email: string;
		otp: string;
	}): Promise<void> {
		await this.client.emails.send({
			from: this.from,
			to: input.email,
			subject: "Verify your email",
			html: `<p>Your verification code is <strong>${input.otp}</strong>.</p>`,
		});
	}

	async sendPasswordResetOTP(input: {
		email: string;
		otp: string;
	}): Promise<void> {
		await this.client.emails.send({
			from: this.from,
			to: input.email,
			subject: "Reset your password",
			html: `<p>Your password reset code is <strong>${input.otp}</strong>.</p>`,
		});
	}
}
