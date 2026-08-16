"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

/** Length of the chain. More nodes = longer, lazier tail. */
const NODES = 26;
/** How hard each node is pulled toward the one ahead of it. */
const EASE = 0.32;

/**
 * A comet that chases the pointer.
 *
 * Rather than stamping a dot per mousemove, this is a chain: the head eases
 * toward the cursor and every node eases toward the node ahead of it. The
 * result flows and whips around corners instead of tracing a dotted path.
 * Thickness tapers along the chain, brightness scales with speed, and
 * clicking scatters a few sparks.
 *
 * Skipped on touch devices and under prefers-reduced-motion.
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

    const target = { x: -100, y: -100 };
    let nodes: Node[] = Array.from({ length: NODES }, () => ({ ...target }));
    let sparks: Spark[] = [];
    let speed = 0;
    let raf = 0;
    let started = false;

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
      const dx = e.clientX - target.x;
      const dy = e.clientY - target.y;
      // smoothed pointer speed, drives glow and thickness
      speed = Math.min(Math.hypot(dx, dy) * 0.5 + speed * 0.7, 40);

      if (!started) {
        // avoid a whip across the screen on the very first move
        nodes = nodes.map(() => ({ x: e.clientX, y: e.clientY }));
        started = true;
      }
      target.x = e.clientX;
      target.y = e.clientY;
    }

    function onClick(e: MouseEvent) {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
        const power = 1.5 + Math.random() * 2.5;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * power,
          vy: Math.sin(angle) * power,
          life: 1,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const accent =
        getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
        "#9d84ff";

      // chain physics: head chases the cursor, everyone else chases the head
      nodes[0].x += (target.x - nodes[0].x) * EASE;
      nodes[0].y += (target.y - nodes[0].y) * EASE;
      for (let i = 1; i < nodes.length; i++) {
        nodes[i].x += (nodes[i - 1].x - nodes[i].x) * EASE;
        nodes[i].y += (nodes[i - 1].y - nodes[i].y) * EASE;
      }
      speed *= 0.9;

      if (started) {
        const boost = Math.min(speed / 18, 1);
        ctx.lineCap = "round";
        ctx.strokeStyle = accent;
        ctx.shadowColor = accent;

        for (let i = 1; i < nodes.length; i++) {
          const t = 1 - i / nodes.length; // 1 at the head, 0 at the tail
          ctx.beginPath();
          ctx.moveTo(nodes[i - 1].x, nodes[i - 1].y);
          ctx.lineTo(nodes[i].x, nodes[i].y);
          ctx.lineWidth = 0.5 + t * (2.5 + boost * 3.5);
          ctx.globalAlpha = t * (0.35 + boost * 0.5);
          ctx.shadowBlur = 8 * t * boost;
          ctx.stroke();
        }

        // bright core at the head
        ctx.beginPath();
        ctx.arc(nodes[0].x, nodes[0].y, 2 + boost * 2, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.5 + boost * 0.5;
        ctx.shadowBlur = 12 * boost;
        ctx.fill();
      }

      // click sparks
      for (const s of sparks) {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy = s.vy * 0.94 + 0.06; // a little gravity
        s.life -= 0.022;

        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.6 * s.life + 0.4, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = Math.max(s.life, 0);
        ctx.shadowBlur = 6 * s.life;
        ctx.fill();
      }
      sparks = sparks.filter((s) => s.life > 0);

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onClick);
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
