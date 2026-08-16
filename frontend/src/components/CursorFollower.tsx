"use client";

import { useEffect, useRef } from "react";

/** How hard the ring is pulled toward the cursor. Lower = more lag. */
const EASE = 0.16;

/**
 * Two-part cursor: a small dot pinned exactly to the pointer, and a ring
 * that eases in behind it. Over anything clickable the ring expands and
 * fills while the dot fades — so the cursor reads as a state indicator
 * rather than decoration.
 *
 * Positions are written straight to style.transform on each frame, so this
 * never re-renders React and stays on the compositor.
 *
 * Skipped on touch devices and under prefers-reduced-motion.
 */
export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const pointer = { x: -100, y: -100 };
    const eased = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let raf = 0;

    function onMove(e: MouseEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      if (!visible) {
        // jump into place rather than flying in from the corner
        eased.x = pointer.x;
        eased.y = pointer.y;
        visible = true;
        dot!.style.opacity = "1";
        ring!.style.opacity = "1";
      }

      // grow over anything the user can actually interact with
      const el = e.target as HTMLElement | null;
      const interactive = el?.closest("a, button, input, textarea, [role='button']");
      targetScale = interactive ? 1.9 : 1;
      ring!.dataset.active = interactive ? "true" : "false";
    }

    function onLeave() {
      visible = false;
      dot!.style.opacity = "0";
      ring!.style.opacity = "0";
    }

    function frame() {
      eased.x += (pointer.x - eased.x) * EASE;
      eased.y += (pointer.y - eased.y) * EASE;
      scale += (targetScale - scale) * 0.18;

      dot!.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      ring!.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;

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
        className="pointer-events-none fixed left-0 top-0 z-40 size-8 rounded-full border border-accent/60 opacity-0 transition-[opacity,background-color] duration-300 data-[active=true]:bg-accent/10"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 size-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-300"
      />
    </>
  );
}
