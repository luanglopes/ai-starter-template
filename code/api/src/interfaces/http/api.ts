import { Hono } from "hono";
import { auth } from "../../infra/better-auth/auth";
import type { AppEnv } from "./AppContext";
import { cors } from "./middleware/cors";
import { apiRouter } from "./router";

const app = new Hono<AppEnv>();

// Apply CORS
app.use("*", cors);

// Apply test auth middleware in test environment
if (process.env.NODE_ENV === "test") {
	app.use("/api/*", async (c, next) => {
		const userId = c.req.header("X-User-Id");
		if (userId) {
			c.set("userId", userId);
		}
		await next();
	});
}

// Auth routes
app.on(["GET", "POST"], "/api/auth/*", (c) => auth(c.env).handler(c.req.raw));

// API routes
app.route("/api", apiRouter);

export default app;
