import * as simpleIcons from "simple-icons";
import { Java } from "./BrandIcons";

type SimpleIcon = { path: string; hex: string; title: string };

/** "nextdotjs" -> "siNextdotjs" */
function lookup(slug?: string): SimpleIcon | null {
  if (!slug) return null;
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  const icon = (simpleIcons as unknown as Record<string, SimpleIcon>)[key];
  return icon ?? null;
}

/**
 * Brand mark for a technology, drawn from simple-icons in its own colour.
 * Anything without a published mark (AWS, Java) falls back to a neutral
 * dot so the chip still lines up with its neighbours.
 */
export default function TechIcon({
  slug,
  size = 16,
  mono = false,
}: {
  slug?: string;
  size?: number;
  /** Draw in the current text colour instead of the brand's own. */
  mono?: boolean;
}) {
  // Java has no simple-icons mark, so it comes from BrandIcons instead
  if (slug === "java") return <Java size={size} className={mono ? "fill-current" : undefined} />;

  const icon = lookup(slug);

  if (!icon) {
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 rounded-full bg-muted/50"
        style={{ width: size * 0.6, height: size * 0.6 }}
      />
    );
  }

  // Pure-black marks (Next.js, Vercel, Express) vanish on a dark background.
  const dark = ["000000", "0A0A0A", "181717"].includes(icon.hex.toUpperCase());

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={`shrink-0 ${mono || dark ? "fill-current" : ""}`}
      fill={mono || dark ? undefined : `#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
