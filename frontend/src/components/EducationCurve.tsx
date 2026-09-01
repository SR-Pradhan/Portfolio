"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
    // Finishes while the section is still comfortably in view. With the old
    // "end 0.45" the line only completed once the section was most of the way
    // off the top, so the last node lit after you had stopped looking at it.
    offset: ["start 0.85", "end 0.65"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // a node lights up once the drawn line reaches it
  const relight = useCallback(
    (v: number) => setLit(nodes.filter((n) => v >= n.at - 0.02).length),
    [nodes],
  );

  useMotionValueEvent(drawn, "change", relight);

  /**
   * Also recompute when the nodes themselves change.
   *
   * Measuring finishes a frame or two after mount, and the scroll spring only
   * emits while it is actually moving. Land partway down the page, or measure
   * after the spring has settled, and the only `lit` value ever computed was
   * the one from the empty node list — so the line draws past nodes that never
   * light up.
   */
  useEffect(() => {
    relight(drawn.get());
  }, [relight, drawn]);

  /**
   * Walk the path for the point at a given viewBox y. y increases
   * monotonically, so a binary search on arc length converges.
   *
   * Returns the arc-length fraction as well as x, and that distinction matters:
   * `pathLength` animates along the *curve*, not down the page. This serpentine
   * travels further per vertical pixel where it swings sideways, so a node
   * three quarters of the way down the section sits past three quarters of the
   * line's length. Comparing the draw progress against a height fraction lights
   * the lower nodes late, or not at all before the scroll range ends.
   */
  const pointAtY = useCallback((path: SVGPathElement, targetY: number) => {
    const total = path.getTotalLength();
    let lo = 0;
    let hi = total;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).y < targetY) lo = mid;
      else hi = mid;
    }
    const len = (lo + hi) / 2;
    return { x: path.getPointAtLength(len).x, at: total ? len / total : 0 };
  }, []);

  /**
   * Distance from `container`'s top to `el`'s top.
   *
   * NOT `el.offsetTop`: that is measured from the nearest *positioned*
   * ancestor, and every row is wrapped in a `Reveal` motion div. Each row
   * therefore reports its offset inside its own wrapper, which is ~0, and all
   * the nodes pile up at the same height near the top of the section looking
   * like a single dot.
   *
   * Summing the offsetParent chain is immune to that, and unlike
   * getBoundingClientRect it is pure layout, so Reveal's entrance transform
   * cannot skew it mid-animation.
   */
  const topWithin = useCallback((el: HTMLElement, container: HTMLElement) => {
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== container) {
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return y;
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
        const centre = topWithin(row, container) + row.offsetHeight / 2;
        const fraction = centre / height;
        const { x, at } = pointAtY(path, fraction * VB_H);
        return { x, top: centre, at };
      }),
    );
  }, [pointAtY, topWithin]);

  useLayoutEffect(() => {
    let frame1 = 0;
    let frame2 = 0;

    // wait a full layout+paint cycle before trusting offsetTop/offsetHeight
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(measure);
      });
    };

    scheduleMeasure();

    const container = ref.current?.parentElement;
    if (!container || typeof ResizeObserver === "undefined") return;

    // re-measure on container resize AND on any individual row resize
    // (e.g. text reflow from late-loading fonts changes a row's height
    // without necessarily changing the container's own height first)
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(container);
    container
      .querySelectorAll<HTMLElement>("[data-edu-row]")
      .forEach((row) => observer.observe(row));

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      observer.disconnect();
    };
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
          // The unlit ring sits on a starfield, so a dim grey circle reads as a
          // stray star rather than a node. The background-coloured outer ring
          // punches a clean hole around it.
          className={`absolute z-20 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-surface transition-all duration-500 ${
            i < lit
              ? "node-lit"
              : "border-muted shadow-[0_0_0_5px_var(--background)]"
          }`}
        />
      ))}
    </div>
  );
}