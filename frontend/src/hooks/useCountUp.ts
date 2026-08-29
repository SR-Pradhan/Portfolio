"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts from zero to a target once the element is on screen.
 *
 * The numbers on this page are the point of it — contributions, views, round
 * trips — and a number that arrives already final reads as static text. Counted
 * up, it reads as a reading being taken.
 *
 * Returns a ref to attach and the value to render. Before the element is seen
 * the value is the target, not zero, so a visitor who never scrolls past it
 * (or who has JavaScript animation disabled) still sees the truth.
 */
export function useCountUp(target: number, duration = 900) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el || target <= 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // ease-out cubic: fast enough to feel responsive, settling rather
          // than stopping dead on the final digit
          setValue(Math.round(target * (1 - (1 - t) ** 3)));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        setValue(0);
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "-40px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, value };
}
