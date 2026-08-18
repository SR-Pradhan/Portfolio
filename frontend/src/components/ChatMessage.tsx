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
  const lines = content.split("\n");
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
