import Image from "next/image";
import { achievements, type Achievement } from "@/data/site";
import Padlock from "../Padlock";
import Reveal from "../Reveal";
import ScrollRail from "../ScrollRail";
import Section from "../Section";

function Card({ item }: { item: Achievement }) {
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
        <span className="rounded-md border border-accent/50 px-3 py-1 font-mono text-xs text-accent">
          {item.year}
        </span>

        {/* hint and payoff are stacked; hover cross-fades between them */}
        {item.hint && (
          <span className="relative text-right text-xs">
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
 * Absolutely positioned so a hidden proof contributes no height — otherwise
 * every row would be as tall as its image and the section would be mostly
 * empty space. Desktop only; there's no hover on touch.
 */
function Proof({ item, side }: { item: Achievement; side: "left" | "right" }) {
  if (!item.photo) return null;
  return (
    <div
      className={`pointer-events-none absolute top-1/2 hidden aspect-[16/10] w-[calc(50%-1.5rem)] max-w-sm -translate-y-1/2 scale-95 overflow-hidden rounded-2xl border-2 border-accent opacity-0 shadow-[0_0_30px_-8px_var(--accent)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 md:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      <span className="absolute right-3 top-3 z-10 rounded bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
        Unlocked
      </span>
      <Image
        src={item.photo}
        alt={`${item.title} — proof`}
        width={640}
        height={400}
        className="size-full object-cover"
      />
    </div>
  );
}

export default function Achievements() {
  return (
    <Section
      id="achievements"
      title="Achievements"
      sub="Hover a card to unlock the proof"
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
                    className="absolute left-1/2 hidden size-2.5 -translate-x-1/2 rounded-full bg-border transition-colors duration-300 group-hover:bg-accent group-hover:shadow-[0_0_12px_2px_var(--accent)] md:block"
                  />

                  <div className={cardLeft ? "md:pr-0" : "md:col-start-2"}>
                    <Card item={item} />
                  </div>
                  {/* proof sits in the empty half, out of the flow */}
                  <Proof item={item} side={cardLeft ? "right" : "left"} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
