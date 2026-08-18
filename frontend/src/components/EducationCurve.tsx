"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

/** The serpentine both paths follow. Kept in one place so they can't drift. */
const PATH = "M80 0 C 8 170, 152 330, 80 500 C 8 670, 152 830, 80 1000";

/**
 * The Education timeline's connector.
 *
 * Two stacked copies of the same curve: a faint dotted "route" showing where
 * the line goes, and a solid accent line that draws itself along that route
 * as you scroll the section — so the timeline builds as you read down it.
 *
 * `preserveAspectRatio="none"` lets the curve stretch to whatever height the
 * cards end up being, and `vector-effect="non-scaling-stroke"` stops that
 * stretch from smearing the round dashes into ovals.
 */
export default function EducationCurve() {
  // useScroll wants an HTMLElement, so the ref lives on a wrapper div
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // draws while the section travels through the middle of the viewport
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
      className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[160px] -translate-x-1/2 md:block"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 160 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="edu-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
            <stop offset="35%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.9" />
          </linearGradient>
          <filter id="edu-glow" x="-60%" y="-10%" width="220%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* the route: always visible, faint */}
        <path
          d={PATH}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeDasharray="1 11"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.28"
        />

        {/* the drawn line: pathLength animates 0 -> 1 with scroll */}
        <motion.path
          d={PATH}
          fill="none"
          stroke="url(#edu-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter="url(#edu-glow)"
          style={{ pathLength: drawn }}
        />
      </svg>
    </div>
  );
}
