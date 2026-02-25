import {
	AILimitError,
	ConflictError,
	EmailNotVerifiedError,
	NotFoundError,
	UnauthenticatedError,
	UnauthorizedError,
	ValidationError,
} from "../../../app/domain/errors";
import type { AppContext } from "../AppContext";

function getHttpStatusForError(error: Error): number {
	if (error instanceof NotFoundError) return 404;
	if (error instanceof UnauthenticatedError) return 401;
	if (error instanceof UnauthorizedError) return 403;
	if (error instanceof EmailNotVerifiedError) return 403;
	if (error instanceof ConflictError) return 409;
	if (error instanceof ValidationError) return 400;
	if (error instanceof AILimitError) return 402;
	return 500;
}

export function createErrorResponse(ctx: AppContext, error: Error): Response {
	const status = getHttpStatusForError(error);
	let message = error.message;
	let type = error.name;
	let metadata: Record<string, unknown> | undefined;
	if (error instanceof AILimitError) {
		metadata = error.metadata;
	}
	if (status === 500) {
		console.error(`[${ctx.req.path}] Internal Server Error:`, error);
		message = "Internal server error";
		type = "InternalServerError";
	}
	return new Response(
		JSON.stringify({
			error: message,
			type,
			...(metadata && { metadata }),
		}),
		{
			status,
			headers: { "Content-Type": "application/json" },
		},
	);
}
