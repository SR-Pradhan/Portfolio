import { ArrowUpRight } from "lucide-react";
import { experience } from "@/data/site";
import { techEmoji, techSlug } from "@/lib/techSlugs";
import { tenure } from "@/lib/tenure";
import Reveal from "../Reveal";
import SpotlightCard from "../SpotlightCard";
import TechIcon from "../TechIcon";
import ScrollRail from "../ScrollRail";
import Section from "../Section";

export default function Experience() {
  return (
    <Section id="experience" title="Experience" sub="My professional journey">
      {/* the rail runs down the left; each card hangs off a node */}
      <ol className="relative ml-2 pl-6 md:ml-6 md:pl-10">
        <ScrollRail className="left-0" />

        {experience.map((job, i) => (
          <li key={i} className="relative pb-8 last:pb-0">
            <Reveal delay={i * 0.06}>
              <span className="absolute -left-[calc(1.5rem+6px)] top-7 size-3 rounded-full border-2 border-accent bg-background shadow-[0_0_10px_2px_var(--accent)] md:-left-[calc(2.5rem+6px)]" />

              <SpotlightCard>
                {/* The start year as a watermark, the same idiom the project
                    cards use for their index. On a timeline it does a second
                    job: the eye picks up the chronology without reading a
                    single date. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-3 right-3 select-none font-mono text-[7rem] font-bold leading-none text-foreground/[0.035]"
                >
                  {job.period.match(/\d{4}/)?.[0]}
                </span>

                <div className="relative z-10 p-6 md:p-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="flex flex-wrap items-center gap-2.5 text-lg font-semibold tracking-tight">
                      {job.role}
                      {job.kind && (
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-muted">
                          {job.kind}
                        </span>
                      )}
                    </h3>

                    <span className="flex items-center gap-2 font-mono text-xs text-muted">
                      {job.period}
                      {(() => {
                        const span = tenure(job.period);
                        if (!span) return null;
                        return (
                          <>
                            <span aria-hidden className="text-border">
                              ·
                            </span>
                            {/* Worked out from the period beside it, so the two
                                can never disagree. */}
                            <span className="text-foreground">{span.label}</span>
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
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                    {job.companyUrl ? (
                      <a
                        href={job.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        {job.company}
                        <ArrowUpRight size={13} />
                      </a>
                    ) : (
                      <span className="text-accent">{job.company}</span>
                    )}
                    {job.location && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-muted">{job.location}</span>
                      </>
                    )}
                  </div>

                  {/* Numbered rather than bulleted. Four dots read as prose that
                      happens to be chopped up; an index reads as a record of
                      separate things done, which is what these are. */}
                  <ol className="mt-5 space-y-2.5">
                    {job.points.map((point, n) => (
                      <li
                        key={point}
                        className="flex gap-3 text-sm leading-relaxed text-muted"
                      >
                        <span className="mt-px shrink-0 font-mono text-[11px] text-accent/70">
                          {String(n + 1).padStart(2, "0")}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ol>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {job.stack.map((t) => (
                      <li
                        key={t}
                        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
                      >
                        {techSlug(t) ? (
                          <TechIcon slug={techSlug(t)} size={12} />
                        ) : techEmoji(t) ? (
                          <span
                            aria-hidden
                            className="text-[12px] leading-none"
                          >
                            {techEmoji(t)}
                          </span>
                        ) : null}
                        {t}
                      </li>
                    ))}
                  </ul>

                  {job.links && job.links.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm">
                      {job.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-muted transition hover:text-accent"
                        >
                          {link.label}
                          <ArrowUpRight size={13} className="shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
