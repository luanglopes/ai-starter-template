import { ulidFactory } from "ulid-workers";

const ulid = ulidFactory();

export function generateULID() {
	return ulid(Date.now());
}
