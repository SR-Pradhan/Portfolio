import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * Shared shell for every page section: id anchor, max width, and a
 * centred header — title with an accent full stop, subtitle beneath.
 */
export default function Section({
  id,
  title,
  sub,
  children,
  className = "",
}: {
  id: string;
  title?: string;
  sub?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 py-24 md:py-32 ${className}`}>
      {title && (
        <Reveal className="mb-16 text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
            <span className="text-accent">.</span>
          </h2>
          {sub && <p className="mt-4 text-lg text-muted">{sub}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}
