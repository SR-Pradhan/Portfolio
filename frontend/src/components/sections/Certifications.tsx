import { ArrowUpRight } from "lucide-react";
import { certifications } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";
import TechIcon from "../TechIcon";

/**
 * Deliberately a dense list rather than another card grid — this section
 * follows two of them, and a credential carries too little information to
 * justify a card of its own.
 */
export default function Certifications() {
  return (
    <Section
      id="certifications"
      title="Certifications"
      sub="Courses and credentials I've completed"
    >
      <Reveal>
        <ul className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {certifications.map((c) => {
            const Row = c.url ? "a" : "div";
            return (
              <li key={`${c.title}-${c.year}`}>
                <Row
                  {...(c.url ? { href: c.url, target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent-soft/40 sm:gap-5 sm:px-6"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background">
                    <TechIcon slug={c.icon} size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-snug transition-colors group-hover:text-accent">
                      {c.title}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">{c.issuer}</p>
                  </div>

                  <span className="shrink-0 font-mono text-xs text-muted">{c.year}</span>

                  {c.url && (
                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  )}
                </Row>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </Section>
  );
}
