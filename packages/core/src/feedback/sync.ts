/**
 * Feedback sync — exports local feedback records for cloud upload.
 *
 * Reads from the local SQLite feedback.db and maps records to the
 * cloud-compatible FeedbackEvent format for batch upload.
 */

import type { FeedbackEvent } from "../cloud/types";
import { getFeedbackDb } from "../db/index";

/** Raw row shape from the feedback table. */
interface FeedbackRow {
	prompt_hash: string;
	command: string;
	accepted: number;
	context: string | null;
	created_at: string;
}

/**
 * Export all local feedback records in the cloud-compatible format.
 *
 * Reads from the feedback table in the SQLite database at `mainaDir/feedback.db`
 * and maps each row to a `FeedbackEvent` object ready for batch upload.
 */
export function exportFeedbackForCloud(mainaDir: string): FeedbackEvent[] {
	const dbResult = getFeedbackDb(mainaDir);
	if (!dbResult.ok) {
		return [];
	}

	const { db } = dbResult.value;

	const rows = db
		.query(
			"SELECT prompt_hash, command, accepted, context, created_at FROM feedback ORDER BY created_at ASC",
		)
		.all() as FeedbackRow[];

	return rows.map((row) => {
		const event: FeedbackEvent = {
			promptHash: row.prompt_hash,
			command: row.command,
			accepted: row.accepted === 1,
			timestamp: row.created_at,
		};

		if (row.context) {
			event.context = row.context;
		}

		return event;
	});
}
