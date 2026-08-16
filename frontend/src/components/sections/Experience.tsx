import { experience } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function Experience() {
  return (
    <Section id="experience" eyebrow="04 / where i've worked" title="Experience">
      <ol className="relative border-l border-border pl-8 md:pl-10">
        {experience.map((job, i) => (
          <li key={`${job.company}-${job.period}`} className="pb-14 last:pb-0">
            <Reveal delay={i * 0.06}>
              {/* timeline node */}
              <span className="absolute -left-[6.5px] mt-2 size-3 rounded-full border-2 border-background bg-accent" />

              <p className="font-mono text-xs text-muted">{job.period}</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                {job.role}{" "}
                <span className="font-normal text-accent">@ {job.company}</span>
              </h3>

              <ul className="mt-4 space-y-2.5">
                {job.points.map((point) => (
                  <li key={point} className="flex gap-3 leading-relaxed text-muted">
                    <span className="mt-2.5 size-1 shrink-0 rounded-full bg-muted" />
                    {point}
                  </li>
                ))}
              </ul>

              <ul className="mt-5 flex flex-wrap gap-2">
                {job.stack.map((t) => (
                  <li
                    key={t}
                    className="rounded-md bg-surface px-2.5 py-1 font-mono text-xs text-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
