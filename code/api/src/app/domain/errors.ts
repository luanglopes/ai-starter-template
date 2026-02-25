/**
 * Custom error classes for proper HTTP status code mapping
 */

export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}

export class UnauthenticatedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnauthenticatedError";
	}
}

export class UnauthorizedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnauthorizedError";
	}
}

export class ConflictError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ConflictError";
	}
}

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}

export class EmailNotVerifiedError extends Error {
	constructor() {
		super("Email verification is required for this action");
		this.name = "EmailNotVerifiedError";
	}
}

export type AILimitMetadata = {
	limitType: "ai_enhancements";
	plan: "free" | "starter" | "pro";
	used: number;
	limit: number;
};

export class AILimitError extends Error {
	public readonly metadata: AILimitMetadata;

	constructor(message: string, metadata: AILimitMetadata) {
		super(message);
		this.name = "AILimitError";
		this.metadata = metadata;
	}
}
