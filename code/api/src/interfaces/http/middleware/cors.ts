import { cors as honoCors } from "hono/cors";

export const getAllowedDomains = (origin: string, env: Env) => {
	// TODO: Replace with your production domains
	const allowedDomains = [
		"https://platform.template.app",
		"https://api.template.app",
	];
	if (env.ENVIRONMENT !== "production") {
		allowedDomains.push("http://localhost:5173", "http://localhost:8787");
		if (origin) allowedDomains.push(origin);
	}
	return allowedDomains;
};

const isDomainAllowed = (origin: string, env: Env) => {
	const allowedDomains = getAllowedDomains(origin, env);
	return allowedDomains.some((allowed) => origin.endsWith(allowed));
};

export const cors = honoCors({
	origin(origin, c) {
		if (isDomainAllowed(origin, c.env)) return origin;
		return;
	},
	credentials: true,
});
