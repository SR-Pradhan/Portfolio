"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  /** px per frame upward — the visible motion */
  vy: number;
  /** px per frame sideways, much gentler */
  vx: number;
  /** twinkle offset and rate, deliberately separate from drift */
  phase: number;
  twinkle: number;
};

/**
 * Slow-drifting starfield painted behind the whole page.
 * Density scales with viewport area, so it looks the same on a laptop
 * and an ultrawide. Honours prefers-reduced-motion by rendering static.
 */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let frame = 0;
    let raf = 0;

    /** Stars are white on dark, near-black on light. */
    const isDark = () => document.documentElement.classList.contains("dark");

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((w * h) / 11000);
      stars = Array.from({ length: count }, () => {
        const r = Math.random() * 1.3 + 0.35;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          // bigger stars read as nearer, so they drift faster — cheap parallax.
          // ~10-30px/sec at 60fps: clearly moving, never distracting.
          vy: (0.16 + Math.random() * 0.34) * (0.6 + r / 1.65),
          vx: (Math.random() - 0.5) * 0.08,
          phase: Math.random() * Math.PI * 2,
          twinkle: Math.random() * 0.03 + 0.01,
        };
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const rgb = isDark() ? "255,255,255" : "20,20,30";
      const base = isDark() ? 0.55 : 0.35;

      for (const s of stars) {
        const twinkle = reduced
          ? 0.6
          : 0.45 + Math.sin(frame * s.twinkle + s.phase) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${(twinkle * base).toFixed(3)})`;
        ctx.fill();

        if (!reduced) {
          s.y -= s.vy;
          s.x += s.vx;
          // wrap around the edges
          if (s.y < -2) {
            s.y = h + 2;
            s.x = Math.random() * w;
          }
          if (s.x < -2) s.x = w + 2;
          if (s.x > w + 2) s.x = -2;
        }
      }

      frame += 1;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
