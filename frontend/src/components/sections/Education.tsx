import { GraduationCap } from "lucide-react";
import { education } from "@/data/site";
import EducationCurve from "../EducationCurve";
import Reveal from "../Reveal";
import Section from "../Section";
import SpotlightCard from "../SpotlightCard";

export default function Education() {
  return (
    <Section id="education" title="Education" sub="The formal part of the story">
      <div className="relative">
        <EducationCurve />

        <div className="space-y-6 md:space-y-4">
          {education.map((e, i) => {
            const left = i % 2 === 0;
            return (
              <Reveal key={i} delay={0.05}>
                <div className="relative md:grid md:grid-cols-2 md:gap-16">
                  {/* node on the rail, level with its card */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-background shadow-[0_0_12px_2px_var(--accent)] md:block"
                  />

                  <div className={left ? "" : "md:col-start-2"}>
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
                          <p className="mt-4 text-sm leading-relaxed text-muted">
                            {e.detail}
                          </p>
                        )}
                      </div>
                    </SpotlightCard>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* end cap — closes the line instead of letting it stop mid-air */}
        <Reveal className="relative mt-4 hidden justify-center md:flex">
          <span className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
            <span className="size-2 rounded-full bg-accent shadow-[0_0_10px_2px_var(--accent)]" />
            it started here
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
          </span>
        </Reveal>
      </div>
    </Section>
  );
}
