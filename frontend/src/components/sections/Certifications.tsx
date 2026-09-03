"use client";

import { ArrowUpRight, Hourglass } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { certifications, certificationsMore } from "@/data/site";
import { useCoarsePointer } from "@/lib/ui";
import ProofLightbox from "../ProofLightbox";
import Reveal from "../Reveal";
import Section from "../Section";
import TechIcon from "../TechIcon";

export default function Certifications() {
  const trackRef = useRef<HTMLDivElement>(null);
  // the certificate scan being viewed, if any
  const [open, setOpen] = useState<{ image: string; title: string } | null>(null);
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  // 0 when the section first enters the viewport, 1 once it has left the top
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  // scrolling down drags the row leftwards
  const x = useTransform(smooth, [0, 1], ["10%", "-10%"]);

  return (
    <Section
      id="certifications"
      index={7}
      title="Certifications"
      sub="Courses and credentials I've completed"
      // cards ride off the edges instead of stopping short of them
      className="overflow-hidden"
    >
      <Reveal>
        {/* Two ways through the same row.

            With a mouse the track drifts as the page scrolls — there is no
            gesture for sideways movement, so the page supplies one. With a
            finger there is: the row becomes a real scroller and the drift is
            switched off, because a track that moves on its own while you are
            dragging it fights you. Snap points stop a swipe leaving a card
            half off the screen.

            The negative margin and matching padding let the row bleed to the
            screen edges while its first card still lines up with the section's
            text above it. */}
        <div
          ref={trackRef}
          data-cert-track
          className={
            coarse
              ? "-mx-6 snap-x snap-mandatory overflow-x-auto scroll-px-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : undefined
          }
        >
          <motion.div
            style={reduced || coarse ? undefined : { x }}
            className={`flex w-max gap-6 ${coarse ? "" : "mx-auto"}`}
          >
            {certifications.map((c, i) => {
              // A credential URL is the strongest proof, so it wins the click.
              // Failing that, the scan is what lets someone verify the claim.
              const Card = c.url ? "a" : c.image ? "button" : "div";
              return (
                <Card
                  // index key: the list is static and never reorders, and
                  // title+year can legitimately repeat
                  key={i}
                  {...(c.url
                    ? { href: c.url, target: "_blank", rel: "noreferrer" }
                    : c.image
                      ? {
                          onClick: () =>
                            setOpen({ image: c.image!, title: c.title }),
                        }
                      : {})}
                  className={`group relative flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-accent/60 sm:w-80 ${
                    c.url || c.image ? "cursor-pointer" : ""
                  }`}
                >
                  {/* The subject's mark, doing the job the year does on the
                      timelines: filling the card's empty corner and saying what
                      this is about before the title is read. Bottom-right —
                      top-left holds the issuer tile and top-right the arrow.
                      Drawn mono, because a full-colour logo at this size stops
                      being a watermark and becomes the loudest thing here. */}
                  {c.tech && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-4 -right-3 select-none text-foreground/[0.05] transition-colors duration-500 group-hover:text-accent/20"
                    >
                      <TechIcon slug={c.tech} size={112} mono />
                    </span>
                  )}

                  <div className="relative flex items-start justify-between gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft">
                      {c.logo ? (
                        <Image
                          src={c.logo}
                          alt={`${c.issuer} logo`}
                          width={20}
                          height={20}
                          className="size-5 object-contain"
                        />
                      ) : c.icon ? (
                        <TechIcon slug={c.icon} size={19} />
                      ) : (
                        /* No published mark for this issuer — Scaler, for one,
                           isn't in simple-icons. Its initial beats a generic
                           badge: it identifies the issuer at a glance and works
                           for whatever gets added next, without anyone drawing
                           a logo that isn't theirs to draw. */
                        <span className="font-mono text-base font-bold leading-none text-accent">
                          {c.issuer.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    {(c.url || c.image) && (
                      <ArrowUpRight
                        size={16}
                        className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      />
                    )}
                  </div>

                  <h3 className="relative mt-5 font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                    {c.title}
                  </h3>
                  <p className="relative mt-1 flex-1 text-sm text-muted">{c.issuer}</p>
                  <span className="relative mt-5 w-fit rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted">
                    {c.year}
                  </span>
                </Card>
              );
            })}

            {/* Dashed, and last in the track: says the list is still growing
                without inventing a credential that doesn't exist yet. */}
            {certificationsMore.show && (
              <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-dashed border-border p-6 sm:w-80">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted">
                  <Hourglass size={18} />
                </span>
                <h3 className="mt-5 font-semibold leading-snug tracking-tight text-muted">
                  {certificationsMore.label}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted">
                  {certificationsMore.detail}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </Reveal>

      {open && (
        <ProofLightbox
          photos={[open.image]}
          title={open.title}
          index={0}
          onIndex={() => {}}
          onClose={() => setOpen(null)}
        />
      )}
    </Section>
  );
}
