import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { certifications } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function Certifications() {
  return (
    <Section
      id="certifications"
      title="Certifications"
      sub="Courses and credentials I've completed"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c, i) => {
          const Wrapper = c.url ? "a" : "div";
          return (
            <Reveal key={`${c.title}-${c.year}`} delay={(i % 3) * 0.06} className="h-full">
              <Wrapper
                {...(c.url
                  ? { href: c.url, target: "_blank", rel: "noreferrer" }
                  : {})}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <BadgeCheck size={18} />
                  </span>
                  {c.url && (
                    <ArrowUpRight
                      size={16}
                      className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  )}
                </div>

                <h3 className="mt-5 font-semibold leading-snug tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted">{c.issuer}</p>
                <span className="mt-5 w-fit rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted">
                  {c.year}
                </span>
              </Wrapper>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
