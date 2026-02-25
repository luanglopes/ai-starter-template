import { describe, expect, it } from "vitest";
import { toPlan } from "./entitlements";

describe("toPlan", () => {
	it("returns free for unknown product IDs", () => {
		expect(toPlan("free")).toBe("free");
		expect(toPlan("unknown")).toBe("free");
		expect(toPlan("")).toBe("free");
	});

	it("returns starter for product IDs containing starter", () => {
		expect(toPlan("starter")).toBe("starter");
		expect(toPlan("starter_monthly")).toBe("starter");
	});

	it("returns pro for product IDs containing pro", () => {
		expect(toPlan("pro")).toBe("pro");
		expect(toPlan("pro_monthly")).toBe("pro");
	});
});
