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
 * Global multiplier on drift speed. One knob for the whole field, so tuning it
 * doesn't mean re-balancing the per-star parallax maths below.
 */
const SPEED = 0.55;

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
    let timer = 0;

    /** Stars only exist on the dark theme; see draw(). */
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
          // ~11-33px/sec at 60fps: noticeable if you look, ignorable if you're
          // reading. Tune the whole field with SPEED rather than these numbers.
          vy: (0.32 + Math.random() * 0.62) * (0.6 + r / 1.65) * SPEED,
          vx: (Math.random() - 0.5) * 0.08 * SPEED,
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

      /*
        Stars are a dark-theme idea. On white the same field is dark specks
        drifting across the page, which reads as dust on the screen rather than
        as a night sky. Light mode gets a static dot grid from CSS instead, so
        this bails out entirely rather than drawing a washed-out version.

        It keeps polling so a theme toggle picks straight back up, but on a
        timer rather than a frame: spinning rAF at 60fps to clear an empty
        canvas costs battery for nothing.
      */
      if (!isDark()) {
        timer = window.setTimeout(draw, 250);
        return;
      }

      const rgb = "255,255,255";
      const base = 0.55;

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
      clearTimeout(timer);
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
