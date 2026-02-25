import type { AICallLog, CreateAICallLogInput } from "../domain/aiCallLog";

export interface AICallLogDAO {
	create(input: CreateAICallLogInput): Promise<AICallLog>;
	countByUserSourceSince(params: {
		userId: string;
		source: string;
		since: Date;
	}): Promise<number>;
}
