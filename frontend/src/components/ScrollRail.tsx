"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

/**
 * A straight timeline rail that draws itself as its section scrolls past —
 * the flat-line counterpart to EducationCurve, so every timeline on the page
 * behaves the same way.
 *
 * Renders a faint full-height track with an accent line scaling down over it
 * from the top. scaleY on a 1px element is a compositor-only transform, so
 * this is far cheaper than animating height.
 */
export default function ScrollRail({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 w-px ${className}`}
    >
      <span className="absolute inset-0 bg-border" />
      <motion.span
        style={{ scaleY: drawn }}
        className="absolute inset-0 origin-top bg-accent shadow-[0_0_10px_1px_var(--accent)]"
      />
    </div>
  );
}
