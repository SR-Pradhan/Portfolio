"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * A straight timeline rail that draws itself as its section scrolls past —
 * the flat-line counterpart to EducationCurve, so every timeline on the page
 * behaves the same way.
 *
 * Three layers: a faint full-height track, an accent line scaling down over
 * it from the top, and a glowing head riding the tip of that line.
 *
 * scaleY on a 1px element and translateY on the head are both
 * compositor-only transforms, so this is far cheaper than animating height
 * or top.
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

  // the head sits at the end of the drawn portion
  const headTop = useTransform(drawn, (v) => `${v * 100}%`);
  // and fades out once the line is fully drawn, so it doesn't park at the end
  const headOpacity = useTransform(drawn, [0, 0.04, 0.94, 1], [0, 1, 1, 0]);

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

      <motion.span
        style={{ top: headTop, opacity: headOpacity }}
        className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_4px_var(--accent)]"
      />
    </div>
  );
}
