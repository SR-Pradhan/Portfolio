"use client";

import { Images } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { achievements, type Achievement } from "@/data/site";
import Padlock from "../Padlock";
import ProofLightbox from "../ProofLightbox";
import Reveal from "../Reveal";
import ScrollRail from "../ScrollRail";
import Section from "../Section";

/** The fan tops out at three; more than that stops reading as a stack. */
const photosOf = (item: Achievement) => item.photos?.slice(0, 3) ?? [];

function Card({ item, onOpen }: { item: Achievement; onOpen: () => void }) {
  const count = photosOf(item).length;

  return (
    <article className="rounded-2xl border border-border bg-surface p-6 transition-colors group-hover:border-accent/60">
      <div className="flex items-start gap-4">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors duration-300 group-hover:border-accent group-hover:bg-accent-soft group-hover:text-accent">
          {/* one-shot ring that expands out the moment it unlocks */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border border-accent opacity-0 group-hover:motion-safe:animate-[unlock-pulse_0.65s_ease-out]"
          />
          <Padlock size={17} />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
          <p className="mt-0.5 text-sm text-muted">{item.org}</p>
        </div>
      </div>

      <p className="mt-4 leading-relaxed text-muted">{item.detail}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-accent/50 px-3 py-1 font-mono text-xs text-accent">
            {item.year}
          </span>

          {/*
            The only affordance saying the photos can be opened. It has to be a
            real button, and it has to be visible without hovering: on a phone
            the fan never appears at all, so this is the sole route to the
            photos there.
          */}
          {count > 0 && (
            <button
              onClick={onOpen}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted transition hover:border-accent hover:text-accent"
            >
              <Images size={13} />
              {count === 1 ? "View photo" : `View ${count} photos`}
            </button>
          )}
        </div>

        {/* hint and payoff are stacked; hover cross-fades between them */}
        {item.hint && (
          <span className="relative hidden text-right text-xs sm:block">
            <span className="block text-muted transition-opacity group-hover:opacity-0">
              {item.hint}
            </span>
            <span className="absolute inset-0 font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
              {item.reveal}
            </span>
          </span>
        )}
      </div>
    </article>
  );
}

/**
 * Absolutely positioned so hidden proof contributes no height — otherwise every
 * row would be as tall as its image and the section would be mostly empty
 * space. Desktop only; there's no hover on touch.
 *
 * The stack fans rather than cycling: a timed rotation inside a hover-only
 * panel would hide everything after the first shot from anyone who doesn't
 * hover long enough. The fan is a teaser though — only the top photo is really
 * legible — so clicking anywhere on it opens the lightbox.
 */
function Proof({
  item,
  side,
  onOpen,
}: {
  item: Achievement;
  side: "left" | "right";
  onOpen: (index: number) => void;
}) {
  const photos = photosOf(item);
  if (!photos.length) return null;

  return (
    <div
      // Each fanned card sits 10px lower than the one above it, so the stack's
      // visual centre drifts below the row's centre. Lifting by half the total
      // fan puts the group back on the timeline node.
      style={{ marginTop: -(photos.length - 1) * 5 }}
      className={`proof-stack absolute top-1/2 hidden aspect-[16/10] w-[calc(50%-1.5rem)] max-w-sm -translate-y-1/2 cursor-zoom-in opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      {photos.map((src, i) => (
        <div
          key={src}
          onClick={() => onOpen(i)}
          className="proof-card absolute inset-0 overflow-hidden rounded-2xl border-2 border-accent bg-surface shadow-[0_0_30px_-8px_var(--accent)]"
          // --i drives both the fan angle and the stacking order, so adding a
          // third photo needs no new classes
          style={{ zIndex: photos.length - i, ["--i" as string]: i }}
        >
          <Image
            src={src}
            alt={
              photos.length > 1
                ? `Proof ${i + 1} of ${photos.length} for ${item.title}`
                : `Proof for ${item.title}`
            }
            width={640}
            height={400}
            className="size-full object-cover"
          />
        </div>
      ))}

      {/* sits above the whole stack, not inside the top card */}
      <span
        className="pointer-events-none absolute right-3 top-3 rounded bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-on-accent"
        style={{ zIndex: photos.length + 1 }}
      >
        {photos.length > 1 ? `Unlocked · ${photos.length}` : "Unlocked"}
      </span>
    </div>
  );
}

export default function Achievements() {
  // which achievement's photos are open, and which of them is showing
  const [open, setOpen] = useState<{ item: Achievement; index: number } | null>(
    null,
  );

  return (
    <Section
      id="achievements"
      index={6}
      title="Achievements"
      sub="Hover a card to unlock the proof, or open the photos"
    >
      <div className="relative">
        {/* centre rail, desktop only — same scroll-drawn behaviour as the
            Experience and Education timelines */}
        <ScrollRail className="left-1/2 hidden -translate-x-1/2 md:block" />

        <div className="space-y-10 md:space-y-16">
          {achievements.map((item, i) => {
            const cardLeft = i % 2 === 0;
            return (
              <Reveal key={item.title} delay={0.05}>
                {/* one hover group per row, so the card lights its own proof */}
                <div className="group relative grid items-center gap-6 md:grid-cols-2 md:gap-12">
                  <span
                    aria-hidden
                    // same hollow-ring node as the Experience and Education timelines —
                    // muted until the row is active, then accent + glow
                    className="absolute left-1/2 top-1/2 hidden size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted/70 bg-surface transition-all duration-300 group-hover:border-accent group-hover:bg-background group-hover:shadow-[0_0_12px_2px_var(--accent)] md:block"
                  />

                  {/* The year owns the empty half while the row is at rest, and
                      clears out of the way when the proof photos take that
                      space on hover — the two never compete for it. Achievements
                      without a four-digit year ("Ongoing") simply don't get one
                      rather than being given a made-up date. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none hidden select-none items-center justify-center font-mono text-6xl font-bold leading-none text-foreground/[0.05] transition-opacity duration-300 group-hover:opacity-0 md:flex ${
                      cardLeft ? "md:col-start-2 md:row-start-1" : "md:col-start-1 md:row-start-1"
                    }`}
                  >
                    {item.year.match(/\d{4}/)?.[0]}
                  </span>

                  <div className={cardLeft ? "md:col-start-1 md:row-start-1" : "md:col-start-2 md:row-start-1"}>
                    <Card item={item} onOpen={() => setOpen({ item, index: 0 })} />
                  </div>
                  {/* proof sits in the empty half, out of the flow */}
                  <Proof
                    item={item}
                    side={cardLeft ? "right" : "left"}
                    onOpen={(index) => setOpen({ item, index })}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {open && (
        <ProofLightbox
          photos={photosOf(open.item)}
          title={open.item.title}
          index={open.index}
          onIndex={(index) => setOpen({ item: open.item, index })}
          onClose={() => setOpen(null)}
        />
      )}
    </Section>
  );
}
