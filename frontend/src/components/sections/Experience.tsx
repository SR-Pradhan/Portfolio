import { ArrowUpRight } from "lucide-react";
import { experience } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function Experience() {
  return (
    <Section id="experience" title="Experience" sub="My professional journey">
      {/* the rail runs down the left; each card hangs off a node */}
      <ol className="relative ml-2 border-l border-border pl-6 md:ml-6 md:pl-10">
        {experience.map((job, i) => (
          <li key={`${job.company}-${job.period}`} className="pb-8 last:pb-0">
            <Reveal delay={i * 0.06}>
              <span className="absolute -left-[6px] mt-7 size-3 rounded-full border-2 border-accent bg-background" />

              <article className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/60 md:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="text-lg font-semibold tracking-tight">{job.role}</h3>
                  <span className="font-mono text-xs text-muted">{job.period}</span>
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

                <ul className="mt-5 space-y-2">
                  {job.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-[7px] size-1 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {job.stack.map((t) => (
                    <li
                      key={t}
                      className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
