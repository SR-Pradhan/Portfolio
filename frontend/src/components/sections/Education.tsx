import { GraduationCap } from "lucide-react";
import { education } from "@/data/site";
import Reveal from "../Reveal";
import SpotlightCard from "../SpotlightCard";
import Section from "../Section";

export default function Education() {
  return (
    <Section id="education" title="Education" sub="The formal part of the story">
      <div className="grid gap-5 md:grid-cols-2">
        {education.map((e, i) => (
          <Reveal key={i} delay={(i % 2) * 0.08}>
            <SpotlightCard>
              <div className="relative z-10 flex h-full flex-col p-7">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <GraduationCap size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight">{e.degree}</h3>
                  <p className="mt-1 text-sm text-accent">{e.school}</p>
                  {e.location && (
                    <p className="mt-0.5 text-xs text-muted">{e.location}</p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                <span>{e.period}</span>
                {e.grade && (
                  <>
                    <span className="text-border">·</span>
                    <span className="rounded-md border border-border px-2 py-0.5">
                      {e.grade}
                    </span>
                  </>
                )}
              </div>

              {e.detail && (
                <p className="mt-4 text-sm leading-relaxed text-muted">{e.detail}</p>
              )}
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
