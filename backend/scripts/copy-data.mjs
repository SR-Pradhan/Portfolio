/**
 * Copies src/data into dist/data after `tsc`.
 *
 * `tsc` only emits JavaScript. It ignores `.json` files even with
 * `resolveJsonModule` on, because nothing imports this one — `lib/chat.ts`
 * reads it at runtime with `readFileSync`. So a production build ends up with
 * no knowledge base at all.
 *
 * That failure is silent and expensive: `loadContext()` catches the missing
 * file and returns null, `chatEnabled` goes false, and the deployed chatbot
 * answers every question with the "not configured yet" fallback even though
 * GROQ_API_KEY is set correctly. Nothing logs, nothing throws.
 *
 * Hence this step, and hence the check below rather than a bare copy: if the
 * source is missing, fail the build loudly instead of shipping a mute bot.
 */

import { cpSync, existsSync } from "node:fs";

const SRC = "src/data";
const OUT = "dist/data";

if (!existsSync(`${SRC}/portfolio-context.json`)) {
  console.error(
    `${SRC}/portfolio-context.json is missing. Run \`npm run sync:context\` and commit the result.`,
  );
  process.exit(1);
}

cpSync(SRC, OUT, { recursive: true });
console.log(`copied ${SRC} -> ${OUT}`);
