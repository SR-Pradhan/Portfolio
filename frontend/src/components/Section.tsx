import type { ReactNode } from "react";
import Reveal from "./Reveal";

/** Shared shell for every page section: id anchor, max width, heading + eyebrow. */
export default function Section({
  id,
  eyebrow,
  title,
  sub,
  children,
  className = "",
}: {
  id: string;
  eyebrow?: string;
  title?: string;
  sub?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 py-24 md:py-32 ${className}`}>
      {(eyebrow || title) && (
        <Reveal className="mb-12">
          {eyebrow && (
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          )}
          {sub && <p className="mt-3 text-lg text-muted">{sub}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}
