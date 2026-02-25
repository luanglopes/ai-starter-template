import type { EmailProvider } from "../../app/providers/EmailProvider";
import { ConsoleEmailProvider } from "../console-email/ConsoleEmailProvider";
import { ResendEmailProvider } from "../resend/ResendEmailProvider";
import { ServiceLocator } from "../ServiceLocator";

export function getEmailProvider(env: Env): EmailProvider {
	const override = ServiceLocator.get("emailProvider");
	if (override) return override;

	if (env.RESEND_API_KEY) {
		return new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
	}

	return new ConsoleEmailProvider();
}
