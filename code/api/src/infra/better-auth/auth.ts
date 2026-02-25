import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, captcha, emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { getAllowedDomains } from "../../interfaces/http/middleware/cors";
import { createAutumnClient } from "../autumn/AutumnClient";
import { AutumnEntitlementProvider } from "../autumn/AutumnEntitlementProvider";
import { getConnection } from "../drizzle/connection";
import { generateULID } from "../drizzle/utils/generateULID";
import { getEmailProvider } from "../factories/EmailProviderFactory";
import { user as userTable } from "./auth-schema";

function createInstance(env: Env) {
	const db = getConnection(env);

	return betterAuth({
		baseURL:
			env.ENVIRONMENT === "production"
				? "https://api.template.app"
				: "http://localhost:8787",
		database: drizzleAdapter(db, {
			provider: "pg",
		}),
		rateLimit: {
			window: 60,
			max: 100,
			storage: "database",
			customRules: {
				"/sign-up/email": {
					window: 60,
					max: 3,
				},
				"/sign-in/email": {
					window: 10,
					max: 5,
				},
				"/email-otp/send-verification-otp": {
					window: 60,
					max: 3,
				},
				"/email-otp/request-password-reset": {
					window: 60,
					max: 3,
				},
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			minPasswordLength: 6,
		},
		user: {
			additionalFields: {
				plan: {
					type: "string",
					default: "free",
				},
			},
		},
		advanced: {
			database: {
				generateId: () => generateULID(),
			},
			ipAddress: {
				ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
			},
		},
		trustedOrigins(request) {
			const origin = request?.headers.get("origin") || "";
			return getAllowedDomains(origin, env);
		},
		databaseHooks: {
			user: {
				create: {
					after: async (createdUser) => {
						try {
							const autumn = createAutumnClient(env);
							const entitlementProvider = new AutumnEntitlementProvider(autumn);
							await entitlementProvider.createCustomer({
								id: createdUser.id,
								email: createdUser.email,
								name: createdUser.name,
							});
						} catch (e) {
							console.error(
								"Failed to create Autumn customer, rolling back user:",
								createdUser.id,
								e,
							);
							await db
								.delete(userTable)
								.where(eq(userTable.id, createdUser.id));
							throw e;
						}
					},
				},
			},
		},
		plugins: [
			admin(),
			captcha({
				provider: "cloudflare-turnstile",
				secretKey: env.TURNSTILE_SECRET_KEY ?? "",
				endpoints: [
					"/sign-up/email",
					"/email-otp/send-verification-otp",
					"/email-otp/request-password-reset",
				],
			}),
			emailOTP({
				otpLength: 6,
				expiresIn: 300,
				sendVerificationOnSignUp: true,
				async sendVerificationOTP({ email, otp, type }) {
					const emailProvider = getEmailProvider(env);
					if (type === "email-verification") {
						await emailProvider.sendVerificationOTP({ email, otp });
					} else if (type === "forget-password") {
						await emailProvider.sendPasswordResetOTP({ email, otp });
					}
				},
			}),
		],
	});
}

export function auth(env: Env) {
	return createInstance(env);
}

let CLIAuthInstance: ReturnType<typeof betterAuth> | null = null;
if (process.env.NODE_ENV === "cli") {
	CLIAuthInstance = createInstance({ ENVIRONMENT: "CLI" } as Env);
}
export default CLIAuthInstance;
