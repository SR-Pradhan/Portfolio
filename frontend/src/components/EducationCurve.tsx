"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/** The serpentine both paths follow. Kept in one place so they can't drift. */
const PATH = "M80 0 C 8 170, 152 330, 80 500 C 8 670, 152 830, 80 1000";
const VB_W = 160;
const VB_H = 1000;

type Node = { x: number; top: number; at: number };

/**
 * The Education timeline's connector.
 *
 * Three parts: a faint dotted "route" showing where the line goes, a solid
 * accent line that draws along it as you scroll, and a node per card sitting
 * ON the curve.
 *
 * That last part is why this measures rather than guesses. The curve swings
 * left and right of centre, so a node pinned to `left-1/2` only touches the
 * line where it happens to cross the middle — everywhere else it floats off
 * to one side. Instead each card's vertical centre is measured, and the
 * path's own x at that height is found with getPointAtLength.
 *
 * `preserveAspectRatio="none"` lets the curve stretch to the cards' real
 * height, and `vector-effect="non-scaling-stroke"` stops that stretch from
 * smearing the round dashes into ovals.
 */
export default function EducationCurve() {
  // useScroll wants an HTMLElement, so the ref lives on the wrapper
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [lit, setLit] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    // draws while the section travels through the middle of the viewport
    offset: ["start 0.85", "end 0.45"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // a node lights up once the drawn line reaches it
  useMotionValueEvent(drawn, "change", (v) => {
    setLit(nodes.filter((n) => v >= n.at - 0.02).length);
  });

  /** Walk the path for its x at a given viewBox y. y increases monotonically. */
  const xAtY = useCallback((path: SVGPathElement, targetY: number) => {
    const total = path.getTotalLength();
    let lo = 0;
    let hi = total;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).y < targetY) lo = mid;
      else hi = mid;
    }
    return path.getPointAtLength((lo + hi) / 2).x;
  }, []);

  const measure = useCallback(() => {
    const wrap = ref.current;
    const path = pathRef.current;
    const container = wrap?.parentElement;
    if (!wrap || !path || !container) return;

    const height = container.offsetHeight;
    if (!height) return;

    const rows = Array.from(
      container.querySelectorAll<HTMLElement>("[data-edu-row]"),
    );

    setNodes(
      rows.map((row) => {
        const centre = row.offsetTop + row.offsetHeight / 2;
        const fraction = centre / height;
        return { x: xAtY(path, fraction * VB_H), top: centre, at: fraction };
      }),
    );
  }, [xAtY]);

  useEffect(() => {
    measure();
    const container = ref.current?.parentElement;
    if (!container || typeof ResizeObserver === "undefined") return;

    // card heights change with the viewport, so re-measure when they do
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[160px] -translate-x-1/2 md:block"
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="edu-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="14%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="86%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="edu-route" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="14%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="86%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <filter id="edu-glow" x="-60%" y="-10%" width="220%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* the route: always visible, faint. also the path we measure. */}
        <path
          ref={pathRef}
          d={PATH}
          fill="none"
          strokeWidth="2"
          strokeDasharray="1 11"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          stroke="url(#edu-route)"
        />

        {/* the drawn line: pathLength animates 0 -> 1 with scroll */}
        <motion.path
          d={PATH}
          fill="none"
          stroke="url(#edu-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter="url(#edu-glow)"
          style={{ pathLength: drawn }}
        />
      </svg>

      {/* Nodes are HTML, not SVG circles: the viewBox is stretched vertically,
          which would squash a circle into an ellipse. */}
      {nodes.map((node, i) => (
        <span
          key={i}
          style={{ left: node.x, top: node.top }}
          // unlit uses muted, not border: border-token on the near-black page
          // is invisible, which reads as a missing dot rather than a dim one
          className={`absolute z-20 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-surface transition-all duration-500 ${
            i < lit
              ? "border-accent bg-background shadow-[0_0_12px_2px_var(--accent)]"
              : "border-muted/70"
          }`}
        />
      ))}
    </div>
  );
}
