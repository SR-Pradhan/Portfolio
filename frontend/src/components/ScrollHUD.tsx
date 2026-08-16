"use client";

import { ChevronUp } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/data/site";

/**
 * Terminal-style progress strip pinned to the top of the page.
 *
 *   → 20%   {intro}{about me}{skills_          80% remaining   ⌃
 *
 * The middle track fills as you scroll and prints the sections you've
 * already passed. The chevron opens a jump list of every section.
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPct(Math.round(v * 100));
  });

  // Close the jump list on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const labels = nav.map((n) => n.label.toLowerCase());
  const activeIndex = Math.max(
    0,
    nav.findIndex((n) => n.href === `#${active}`),
  );
  // Everything up to and including the current section, terminal-style.
  const trail = labels
    .slice(0, activeIndex + 1)
    .map((l) => `{${l}}`)
    .join("");

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-10 items-center gap-3 px-3 font-mono text-[11px] sm:gap-4 sm:px-4">
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

        {/* jump list */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Jump to section"
            aria-expanded={open}
            className="grid size-6 place-items-center rounded border border-border text-muted transition hover:border-accent hover:text-accent"
          >
            <ChevronUp
              size={13}
              className={`transition-transform ${open ? "" : "rotate-180"}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-8 w-48 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-xl">
              {nav.map((item) => {
                const isActive = item.href === `#${active}`;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-2 transition-colors ${
                      isActive
                        ? "bg-accent text-white"
                        : "text-muted hover:bg-accent-soft hover:text-accent"
                    }`}
                  >
                    {item.label.toLowerCase()}
                    {isActive && <span className="text-[9px]">●</span>}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
