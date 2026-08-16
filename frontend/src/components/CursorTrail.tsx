"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; life: number };

const MAX_DOTS = 22;
const FADE = 0.045;

/**
 * Trail of accent dots that follows the pointer and fades out behind it.
 * Sits above page content so it stays visible over cards, but never
 * intercepts clicks. Skipped entirely on touch devices and when the user
 * prefers reduced motion.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let dots: Dot[] = [];
    let raf = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMove(e: MouseEvent) {
      dots.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (dots.length > MAX_DOTS) dots.shift();
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Pull the accent straight from the theme so it follows dark/light.
      const accent =
        getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
        "#9d84ff";

      dots.forEach((d, i) => {
        // newer dots are larger — gives the trail its tapered shape
        const t = (i + 1) / dots.length;
        const radius = 1 + t * 4;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = d.life * t * 0.7;
        ctx.fill();
        d.life -= FADE;
      });
      ctx.globalAlpha = 1;

      dots = dots.filter((d) => d.life > 0);
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
