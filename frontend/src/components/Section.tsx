import type { ReactNode } from "react";
import AnimatedHeading from "./AnimatedHeading";

/**
 * Shared shell for every page section: id anchor, max width, and a centred
 * header. The header is its own client component because it animates per word
 * on scroll; everything else here stays a server component.
 */
export default function Section({
  id,
  title,
  sub,
  index,
  children,
  className = "",
}: {
  id: string;
  title?: string;
  sub?: string;
  /** Chapter number shown above the title. */
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 py-20 md:py-24 ${className}`}>
      {title && <AnimatedHeading title={title} sub={sub} index={index} />}
      {children}
    </section>
  );
}
