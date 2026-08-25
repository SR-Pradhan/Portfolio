"use client";

import { useEffect, useRef } from "react";

/** How hard the ring is pulled toward the cursor. Lower = more lag. */
const EASE = 0.16;
/** How fast the ring settles onto a snapped target. Higher = crisper latch. */
const SNAP_EASE = 0.26;

const INTERACTIVE = "a, button, input, textarea, [role='button'], [data-cursor]";

/**
 * What this cursor is about to do, in one word.
 *
 * Read off the element itself rather than configured per call site, so a link
 * added later is labelled correctly without anyone remembering to annotate it.
 * `data-cursor` is the override for the handful of cases the heuristics can't
 * infer.
 */
function labelFor(el: HTMLElement): string {
  const override = el.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
  if (override) return override;

  const link = el.closest("a");
  if (link) {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("mailto:")) return "email";
    if (href.startsWith("tel:")) return "call";
    if (href.startsWith("#")) return "jump";
    if (link.target === "_blank") return "open ↗";
    return "open";
  }

  const button = el.closest("button");
  if (button) {
    const expanded = button.getAttribute("aria-expanded");
    if (expanded === "true") return "collapse";
    if (expanded === "false") return "expand";
    const label = (button.getAttribute("aria-label") ?? button.textContent ?? "").toLowerCase();
    if (label.includes("theme") || label.includes("mode")) return "theme";
    if (label.includes("terminal")) return "terminal";
    if (label.includes("palette") || label.includes("command")) return "commands";
    if (label.includes("chat") || label.includes("assistant")) return "ask";
    if (label.includes("close")) return "close";
    if (label.includes("copy")) return "copy";
    if (label.includes("menu")) return "menu";
    return "press";
  }

  if (el.closest("input, textarea")) return "type";
  return "";
}

/**
 * Two-part cursor: a dot pinned to the pointer, and a ring easing in behind it.
 *
 * Over anything interactive the ring stops being a circle and latches onto the
 * element's actual box — matching its size and corner radius — while a one-word
 * label says what a click will do. That turns the cursor from decoration into a
 * readout: it shows the true hit target, which is genuinely useful on a page of
 * pill buttons and chips where the clickable area is larger than the text.
 *
 * Positions are written straight to style on each frame, so this never
 * re-renders React and stays on the compositor.
 *
 * Skipped on touch devices and under prefers-reduced-motion.
 */
export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const IDLE = 32; // the ring's resting diameter, matching size-8

    const pointer = { x: -100, y: -100 };
    const eased = { x: -100, y: -100 };
    const box = { w: IDLE, h: IDLE, r: IDLE / 2 };
    let target: HTMLElement | null = null;
    let visible = false;
    let raf = 0;

    const show = (on: boolean) => {
      const value = on ? "1" : "0";
      dot!.style.opacity = value;
      ring!.style.opacity = value;
      if (!on) label!.style.opacity = "0";
    };

    function onMove(e: MouseEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      if (!visible) {
        // jump into place rather than flying in from the corner
        eased.x = pointer.x;
        eased.y = pointer.y;
        visible = true;
        show(true);
      }

      const el = e.target as HTMLElement | null;
      const hit = el?.closest<HTMLElement>(INTERACTIVE) ?? null;

      if (hit !== target) {
        target = hit;
        const text = hit ? labelFor(hit) : "";
        label!.textContent = text;
        label!.style.opacity = text ? "1" : "0";
        ring!.dataset.active = hit ? "true" : "false";
      }
    }

    function onLeave() {
      visible = false;
      target = null;
      show(false);
    }

    function frame() {
      // A snapped ring tracks the element, not the pointer — and the element
      // moves under it while the page scrolls, so its box is re-read each frame
      // rather than captured once on hover.
      const rect = target?.getBoundingClientRect();
      const wantsSnap = rect && rect.width > 0 && rect.width < window.innerWidth * 0.6;

      const toX = wantsSnap ? rect.left + rect.width / 2 : pointer.x;
      const toY = wantsSnap ? rect.top + rect.height / 2 : pointer.y;
      const ease = wantsSnap ? SNAP_EASE : EASE;

      eased.x += (toX - eased.x) * ease;
      eased.y += (toY - eased.y) * ease;

      // 8px of breathing room so the outline reads as a highlight around the
      // control rather than a border drawn on it.
      const toW = wantsSnap ? rect.width + 8 : IDLE;
      const toH = wantsSnap ? rect.height + 8 : IDLE;
      const radius = wantsSnap
        ? Math.min(parseFloat(getComputedStyle(target!).borderRadius) || 8, toH / 2) + 4
        : IDLE / 2;

      box.w += (toW - box.w) * ease;
      box.h += (toH - box.h) * ease;
      box.r += (radius - box.r) * ease;

      ring!.style.width = `${box.w.toFixed(1)}px`;
      ring!.style.height = `${box.h.toFixed(1)}px`;
      ring!.style.borderRadius = `${box.r.toFixed(1)}px`;
      ring!.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0) translate(-50%, -50%)`;

      dot!.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      // The label rides the pointer, not the ring — it has to stay readable
      // while the ring is off latching onto a wide button.
      label!.style.transform = `translate3d(${pointer.x + 14}px, ${pointer.y + 14}px, 0)`;

      raf = requestAnimationFrame(frame);
    }

    frame();
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        data-active="false"
        className="pointer-events-none fixed left-0 top-0 z-40 size-8 border border-accent/60 opacity-0 transition-[opacity,background-color,border-color] duration-300 data-[active=true]:border-accent data-[active=true]:bg-accent/10"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 size-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-300"
      />
      <div
        ref={labelRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 rounded-md border border-border bg-surface/90 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted opacity-0 backdrop-blur-sm transition-opacity duration-200"
      />
    </>
  );
}
