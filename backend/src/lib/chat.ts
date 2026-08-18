import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The bot's knowledge base, generated from the frontend's site.ts by
 * `npm run sync:context`. Read once at startup — it never changes at runtime.
 */
function loadContext(): string | null {
  try {
    return readFileSync(join(here, "..", "data", "portfolio-context.json"), "utf8");
  } catch {
    return null;
  }
}

const portfolioContext = loadContext();

/**
 * The API key is optional on purpose: without it the chat endpoint answers
 * with a polite fallback instead of failing, so the site runs locally and in
 * preview deploys with no account and no spend. Same pattern as the mailer.
 */
export const chatEnabled = Boolean(process.env.ANTHROPIC_API_KEY && portfolioContext);

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const SYSTEM_PROMPT = `You are the assistant on Sruti Ranjan Pradhan's portfolio website. Visitors are usually recruiters, hiring managers, or engineers deciding whether to reach out.

Answer questions about Sruti's background, projects, skills, and experience using the JSON below. It is your only source of truth about him.

How to answer:
- Be brief. Two or three sentences is usually right; visitors are skimming.
- Be concrete. Name the actual project, technology, or number rather than speaking generally.
- Write in third person about Sruti. You are his site's assistant, not him.
- If something isn't in the JSON, say you don't have that detail and point them at his email or LinkedIn. Never invent employers, dates, grades, or metrics.
- If someone asks something off-topic, redirect to what you can help with in one line.
- Plain prose. No markdown headers, no bullet lists unless genuinely enumerating.

<portfolio_data>
${portfolioContext ?? "{}"}
</portfolio_data>`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Streams a reply, yielding text deltas as they arrive.
 *
 * Effort is `low` with thinking left on (the default). A portfolio FAQ needs
 * fast turnaround, and low effort is the cheap lever — disabling thinking
 * outright is the more expensive one and can leak internal tags into the
 * visible answer.
 */
export async function* streamReply(messages: ChatMessage[]) {
  const stream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: { effort: "low" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // the system prompt is byte-identical on every request, so it caches
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }

  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    yield " …I can't help with that one, but ask me anything about Sruti's work.";
  }
}
