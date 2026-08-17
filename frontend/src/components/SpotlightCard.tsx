"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

/**
 * Card that lights up under the cursor — a soft accent glow tracks the
 * pointer across its surface, and the border brightens nearest to it.
 *
 * Pointer position is written to CSS custom properties on the element itself
 * (not React state), so moving the mouse never triggers a re-render. The
 * glow is drawn by `.spotlight-card::before` in globals.css.
 */
export default function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={`spotlight-card group relative h-full overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-300 hover:border-accent/50 ${className}`}
    >
      {children}
    </div>
  );
}
