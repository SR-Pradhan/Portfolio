"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Where this particle sits when the mark is formed. */
  tx: number;
  ty: number;
  /** Its own drift target while the field is scattered. */
  dx: number;
  dy: number;
};

/** How far a link can reach (CSS px), and how many particles to spend.
 *
 * Both matter more than they look. The first pass sampled every eighth pixel of
 * the glyph, which on a wide hero is a few thousand particles — and since links
 * are drawn between every pair within reach, the field turned into a solid
 * lilac cloud with no letterform left in it. A few hundred points with a
 * shorter reach reads as a network; more reads as fog.
 */
const LINK_DISTANCE = 74;
const PARTICLES = 340;
const PARTICLES_COARSE = 160;
/** Seconds: gather, hold formed, scatter, hold loose. */
const PHASES = [2.6, 3.4, 2.2, 2.0];
const CYCLE = PHASES.reduce((a, b) => a + b, 0);

/**
 * A particle field that gathers into the wordmark and lets go again.
 *
 * The letterforms are not drawn — they are *sampled*. The mark is rendered once
 * to an offscreen canvas, its pixels are read, and every filled pixel above the
 * alpha threshold becomes a possible target. That means the shape always
 * matches whatever `site.initials` says and whatever font the browser actually
 * loaded, rather than a path traced by hand that would drift out of step with
 * both.
 *
 * Between gatherings the particles wander, and any two within reach are linked.
 * The links are the point: a cloud of dots reads as snow, while a graph of them
 * reads as a network, which is what makes the shape legible before it has
 * finished assembling.
 *
 * Sits behind the hero copy at low opacity, pauses when off-screen or when the
 * tab is hidden, and renders one static formed frame under reduced motion.
 */
export default function NeuralMark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let start = performance.now();
    let visible = true;

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
      "#9d84ff";

    /**
     * Read the wordmark's filled pixels, at a stride that yields roughly the
     * particle count we want. Sampling rather than tracing keeps the shape
     * honest to the font that actually rendered.
     */
    function sampleMark(w: number, h: number) {
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return [];

      const size = Math.min(w * 0.34, h * 0.68);
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = `700 ${size}px ${getComputedStyle(document.body).fontFamily}`;
      octx.fillText(`${site.initials}.`, w / 2, h / 2);

      const { data } = octx.getImageData(0, 0, w, h);
      const filled: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
          if (data[(y * w + x) * 4 + 3] > 128) filled.push({ x, y });
        }
      }

      // Sample down to a fixed budget rather than by stride: the count then
      // stays the same whatever the viewport does, and the points stay evenly
      // spread over the glyph instead of thinning at its edges.
      const budget = coarse ? PARTICLES_COARSE : PARTICLES;
      if (filled.length <= budget) return filled;
      for (let i = filled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filled[i], filled[j]] = [filled[j], filled[i]];
      }
      return filled.slice(0, budget);
    }

    function build() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targets = sampleMark(width, height);
      particles = targets.map((t) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        tx: t.x,
        ty: t.y,
        // Wander within a band around the mark rather than the whole canvas:
        // scattered points that fly to the far corners stop reading as the same
        // object that just formed the letters.
        dx: t.x + (Math.random() - 0.5) * width * 0.5,
        dy: t.y + (Math.random() - 0.5) * height * 0.6,
      }));
    }

    /** 0 = fully scattered, 1 = fully formed. */
    function formedness(elapsed: number) {
      const t = (elapsed / 1000) % CYCLE;
      const [gather, hold, scatter] = PHASES;
      if (t < gather) return t / gather;
      if (t < gather + hold) return 1;
      if (t < gather + hold + scatter) return 1 - (t - gather - hold) / scatter;
      return 0;
    }

    function frame(now: number) {
      if (!visible) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const form = formedness(now - start);
      // ease so the field settles into the shape rather than snapping
      const eased = form < 0.5 ? 4 * form ** 3 : 1 - (-2 * form + 2) ** 3 / 2;

      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        const goalX = p.tx * eased + p.dx * (1 - eased);
        const goalY = p.ty * eased + p.dy * (1 - eased);

        // spring toward the goal, with damping, so nothing arrives dead-on and
        // the cloud keeps breathing even while it holds the shape
        p.vx = (p.vx + (goalX - p.x) * 0.012) * 0.9;
        p.vy = (p.vy + (goalY - p.y) * 0.012) * 0.9;
        p.x += p.vx;
        p.y += p.vy;

        // wander targets drift, so a scattered field never looks static
        p.dx += Math.sin(now / 3000 + p.ty) * 0.25;
        p.dy += Math.cos(now / 3400 + p.tx) * 0.25;
      }

      const colour = accent();
      ctx!.strokeStyle = colour;
      ctx!.fillStyle = colour;

      // Links first, so the dots sit on top of their own web. O(n²) is fine at
      // this count and a grid would cost more to maintain than it saves.
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DISTANCE * LINK_DISTANCE) continue;
          const d = Math.sqrt(d2);
          ctx!.globalAlpha = (1 - d / LINK_DISTANCE) * 0.2;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      ctx!.globalAlpha = 0.7;
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }

    build();

    if (reduced) {
      // one formed frame, no loop
      for (const p of particles) {
        p.x = p.tx;
        p.y = p.ty;
      }
      start = performance.now() - PHASES[0] * 1000;
      frame(performance.now());
      cancelAnimationFrame(raf);
      return;
    }

    // Only paint while it is actually on screen: this sits in the hero, and a
    // visitor reading the Contact section should not be paying for it.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 size-full"
    />
  );
}
