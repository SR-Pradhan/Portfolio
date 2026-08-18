import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** Groq exposes an OpenAI-compatible chat-completions endpoint. */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
/**
 * Model IDs vary by Groq account — check `GET /openai/v1/models` with your key
 * if this 404s. Overridable without a code change.
 */
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

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
 * The key is optional on purpose: without it the chat endpoint answers with a
 * polite fallback instead of failing, so the site runs locally and in preview
 * deploys with nothing configured. Same pattern as the mailer.
 */
export const chatEnabled = Boolean(process.env.GROQ_API_KEY && portfolioContext);

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
 * Groq's stream is OpenAI-format SSE: `data: {json}` blocks ending with
 * `data: [DONE]`. Network chunks can split mid-event, so the buffer is only
 * drained on a complete blank-line separator.
 */
export async function* streamReply(messages: ChatMessage[]) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      // gpt-oss models reason before answering, and that reasoning is billed
      // against the same budget — too small a cap gets spent thinking and the
      // visitor sees nothing. Keep effort low so most of it goes to the answer.
      max_tokens: 1024,
      reasoning_effort: "low",
      temperature: 0.6,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq responded ${res.status}: ${detail.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.replace(/^data: /, "").trim();
      if (!line || line === "[DONE]") continue;
      try {
        const json = JSON.parse(line);
        const delta = json.choices?.[0]?.delta;
        // `reasoning` is the model's internal analysis — never show it to
        // visitors. Only `content` is the answer.
        const text: string | undefined = delta?.content;
        if (text) yield text;
      } catch {
        // a malformed frame shouldn't kill the whole stream
      }
    }
  }
}
