import { GraduationCap } from "lucide-react";
import { education } from "@/data/site";
import EducationCurve from "../EducationCurve";
import Reveal from "../Reveal";
import Section from "../Section";
import { tenure } from "@/lib/tenure";
import SpotlightCard from "../SpotlightCard";

export default function Education() {
  return (
    <Section
      id="education"
      title="Education"
      sub="The formal part of the story"
    >
      <div className="relative">
        <EducationCurve />

        <div className="space-y-6 md:space-y-4">
          {education.map((e, i) => {
            const left = i % 2 === 0;
            return (
              <Reveal key={i} delay={0.05}>
                {/* data-edu-row: EducationCurve measures these to place its
                    nodes on the curve rather than at the centre line */}
                <div
                  data-edu-row
                  className="group/edu relative md:grid md:grid-cols-2 md:gap-16"
                >
                  {/* Half of every row was empty space either side of the
                      curve. The year fills it — quiet enough to stay a
                      background note, large enough that the chronology reads
                      without anyone parsing a date. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none hidden select-none items-center font-mono text-6xl font-bold leading-none text-foreground/[0.05] transition-colors duration-500 group-hover/edu:text-foreground/[0.09] md:flex ${
                      left ? "md:col-start-2 md:row-start-1 md:justify-start" : "md:col-start-1 md:row-start-1 md:justify-end"
                    }`}
                  >
                    {/* The last year in the range, not the first: for a
                        qualification the year it was awarded is the one that
                        means something. "2023 – Present" has only one, so it
                        keeps showing the start. */}
                    {e.period.match(/\d{4}(?![\s\S]*\d{4})/)?.[0]}
                  </span>

                  <div className={left ? "" : "md:col-start-2 md:row-start-1"}>
                    <SpotlightCard>
                      <div className="relative z-10 flex h-full flex-col p-7">
                        <div className="flex items-start gap-4">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent ring-1 ring-transparent transition duration-300 group-hover/edu:ring-accent/40">
                            <GraduationCap size={18} />
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-semibold tracking-tight">
                              {e.degree}
                            </h3>
                            <p className="mt-1 text-sm text-accent">
                              {e.school}
                            </p>
                            {e.location && (
                              <p className="mt-0.5 text-xs text-muted">
                                {e.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                          <span>{e.period}</span>
                          {(() => {
                            // Same derivation as the experience timeline: read
                            // off the period, so the two can't disagree.
                            const span = tenure(e.period);
                            if (!span) return null;
                            return (
                              <>
                                <span className="text-border">·</span>
                                <span className="text-foreground/70">{span.label}</span>
                                {span.current && (
                                  <span className="flex items-center gap-1.5 text-accent">
                                    <span className="relative flex size-1.5">
                                      <span className="live-ping absolute inline-flex size-full rounded-full bg-accent" />
                                      <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                                    </span>
                                    now
                                  </span>
                                )}
                              </>
                            );
                          })()}
                          {e.grade && (
                            <>
                              <span className="text-border">·</span>
                              <span className="rounded-md border border-border px-2 py-0.5 transition-colors duration-300 group-hover/edu:border-accent/30">
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
