"use client";

import { ArrowUpRight, BadgeCheck, Hourglass } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { certifications, certificationsMore } from "@/data/site";
import ProofLightbox from "../ProofLightbox";
import Reveal from "../Reveal";
import Section from "../Section";
import TechIcon from "../TechIcon";

export default function Certifications() {
  const trackRef = useRef<HTMLDivElement>(null);
  // the certificate scan being viewed, if any
  const [open, setOpen] = useState<{ image: string; title: string } | null>(null);
  const reduced = useReducedMotion();

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
      title="Certifications"
      sub="Courses and credentials I've completed"
      // cards ride off the edges instead of stopping short of them
      className="overflow-hidden"
    >
      <Reveal>
        <div ref={trackRef}>
          <motion.div
            style={reduced ? undefined : { x }}
            className="mx-auto flex w-max gap-6"
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
                  className={`group flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-accent/60 sm:w-80 ${
                    c.url || c.image ? "cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft">
                      {c.icon ? (
                        <TechIcon slug={c.icon} size={19} />
                      ) : (
                        <BadgeCheck size={19} className="text-accent" />
                      )}
                    </span>
                    {(c.url || c.image) && (
                      <ArrowUpRight
                        size={16}
                        className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      />
                    )}
                  </div>

                  <h3 className="mt-5 font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                    {c.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{c.issuer}</p>
                  <span className="mt-5 w-fit rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted">
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
