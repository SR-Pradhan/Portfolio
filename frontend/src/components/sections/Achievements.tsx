import { Lock, LockOpen } from "lucide-react";
import Image from "next/image";
import { achievements, type Achievement } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

function Card({ item }: { item: Achievement }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6 transition-colors group-hover:border-accent/60">
      <div className="flex items-start gap-4">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors group-hover:border-accent group-hover:bg-accent-soft group-hover:text-accent">
          {/* the padlock pops open on hover */}
          <Lock size={17} className="transition-opacity group-hover:opacity-0" />
          <LockOpen
            size={17}
            className="absolute opacity-0 transition-opacity group-hover:opacity-100"
          />
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

function Proof({ item }: { item: Achievement }) {
  if (!item.photo) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-accent opacity-0 shadow-[0_0_30px_-8px_var(--accent)] transition-all duration-300 group-hover:opacity-100">
      <span className="absolute right-3 top-3 z-10 rounded bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
        Unlocked
      </span>
      <Image
        src={item.photo}
        alt={`${item.title} — proof`}
        width={640}
        height={400}
        className="h-full w-full object-cover"
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
        {/* centre rail, desktop only */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent md:block"
        />

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

                  <div className={cardLeft ? "md:order-1" : "md:order-2"}>
                    <Card item={item} />
                  </div>
                  <div className={cardLeft ? "md:order-2" : "md:order-1"}>
                    <Proof item={item} />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
