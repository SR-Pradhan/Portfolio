"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useState } from "react";
import { nav } from "@/data/site";

/**
 * Terminal-style progress strip pinned to the top of the page.
 *
 *   → 29%   {home}{background}{projects}_          71% remaining
 *
 * Read-only: it reports where you are. Navigation lives in the pill below.
 */
export default function ScrollHUD({ active }: { active: string }) {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });
  const fillWidth = useTransform(smooth, (v) => `${Math.max(v * 100, 4)}%`);
  const [pct, setPct] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPct(Math.round(v * 100));
  });

  const activeIndex = Math.max(
    0,
    nav.findIndex((n) => n.href === `#${active}`),
  );
  // Everything up to and including the current section, terminal-style.
  const trail = nav
    .slice(0, activeIndex + 1)
    .map((n) => `{${n.label.toLowerCase()}}`)
    .join("");

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-10 items-center gap-4 px-4 font-mono text-[11px]">
        <span className="shrink-0 text-accent">→ {pct}%</span>

        {/* fill track — width animates, so the text inside never distorts */}
        <div className="relative hidden h-6 flex-1 overflow-hidden rounded-sm border border-border bg-surface sm:block">
          <motion.div
            style={{ width: fillWidth }}
            className="absolute inset-y-0 left-0 flex items-center overflow-hidden whitespace-nowrap bg-accent px-2 text-white"
          >
            {trail}
            <span className="ml-px animate-pulse">_</span>
          </motion.div>
        </div>

        <span className="ml-auto shrink-0 text-muted sm:ml-0">
          {100 - pct}% remaining
        </span>
      </div>
    </div>
  );
}
