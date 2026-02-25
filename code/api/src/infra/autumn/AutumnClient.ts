import { Autumn } from "autumn-js";

export function createAutumnClient(env: Env): Autumn {
	return new Autumn({
		secretKey: env.AUTUMN_API_KEY ?? "",
	});
}
