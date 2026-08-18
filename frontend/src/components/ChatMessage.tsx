import { Fragment, type ReactNode } from "react";

/**
 * Renders the light markdown the model emits — **bold**, `-`/`*` bullets, and
 * paragraph breaks — as React elements.
 *
 * Deliberately NOT a markdown library and deliberately NOT
 * dangerouslySetInnerHTML: this text comes from a language model, and a
 * visitor can steer what it says. Building elements means model output can
 * never become markup, so there is no injection surface at all. The tradeoff
 * is that anything beyond this subset renders as plain text, which is the
 * right failure mode for a chat bubble.
 */

/**
 * Strips the dashes the model reaches for regardless of what the system prompt
 * says. Done here rather than in the stream because this sees the whole
 * accumulated message, so a dash split across two SSE deltas still matches.
 *
 * An en dash between digits is a range and becomes a hyphen; everywhere else a
 * dash is prose punctuation and becomes a comma, which is how the rest of the
 * site is written.
 */
function normalizeDashes(text: string): string {
  return text
    .replace(/\u2011/g, "-") // non-breaking hyphen, e.g. "AI\u2011powered"
    .replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1-$2")
    .replace(/\s*[\u2013\u2014]\s*/g, ", ");
}

/** Splits on **bold** spans and returns them as <strong>. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function ChatMessage({ content }: { content: string }) {
  const lines = normalizeDashes(content).split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="ml-1 space-y-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-accent" />
            <span>{inline(b)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }
    flushBullets();
    if (line) {
      blocks.push(<p key={`p-${blocks.length}`}>{inline(line)}</p>);
    }
  }
  flushBullets();

  return <div className="space-y-2">{blocks}</div>;
}
