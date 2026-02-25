import type { Context } from "hono";
import { UnauthenticatedError } from "../../app/domain/errors";
import { auth } from "./auth";

type SessionType = NonNullable<
	Awaited<ReturnType<ReturnType<typeof auth>["api"]["getSession"]>>
>;

export async function getSession(ctx: Context) {
	if (ctx.env.ENVIRONMENT === "test") {
		const userId = ctx.req.header("X-User-Id");
		if (!userId) {
			throw new UnauthenticatedError("No user id provided in test environment");
		}
		return {
			user: {
				id: userId,
				emailVerified: true,
			},
		} as unknown as SessionType;
	}
	const session = await auth(ctx.env).api.getSession({
		headers: ctx.req.raw.headers,
	});
	if (!session || !session.user)
		throw new UnauthenticatedError("No Session found");
	return session;
}
