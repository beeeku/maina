import { getApiKey } from "../config/index";

export interface TryAIResult {
	text: string | null;
	fromAI: boolean;
}

/**
 * Encapsulates the common pattern: check API key -> build prompt -> generate -> fallback.
 * Returns null text if AI is not available (no key, error, etc.)
 */
export async function tryAIGenerate(
	task: string,
	mainaDir: string,
	variables: Record<string, string>,
	userPrompt: string,
): Promise<TryAIResult> {
	const apiKey = getApiKey();
	if (!apiKey) return { text: null, fromAI: false };

	try {
		const { buildSystemPrompt } = await import("../prompts/engine");
		const { generate } = await import("./index");

		const builtPrompt = await buildSystemPrompt(task, mainaDir, variables);
		const result = await generate({
			task,
			systemPrompt: builtPrompt.prompt,
			userPrompt,
			mainaDir,
		});

		if (
			result.text &&
			!result.text.includes("API key") &&
			!result.text.startsWith("[HOST_DELEGATION]")
		) {
			return { text: result.text, fromAI: true };
		}
	} catch {
		// AI failure — return null for fallback
	}
	return { text: null, fromAI: false };
}
