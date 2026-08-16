import { Trophy } from "lucide-react";
import { achievements } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function Achievements() {
  return (
    <Section id="achievements" eyebrow="06 / my professional side" title="Achievements">
      <div className="grid gap-5 sm:grid-cols-2">
        {achievements.map((a, i) => (
          <Reveal key={a.title} delay={(i % 2) * 0.08}>
            <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/60">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Trophy size={18} />
                </span>
                <div>
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-semibold tracking-tight">{a.title}</h3>
                    <span className="font-mono text-xs text-muted">{a.year}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{a.detail}</p>
                </div>
              </div>

              {/* the easter egg — slides up from the bottom edge on hover */}
              {a.secret && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-accent px-6 py-2 text-center font-mono text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
                  {a.secret}
                </span>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
