import { ArrowUpRight } from "lucide-react";
import { Github } from "@/components/BrandIcons";
import { projects } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function Projects() {
  return (
    <Section id="projects" eyebrow="02 / selected work" title="Projects">
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.title} delay={(i % 2) * 0.08}>
            <article
              className={`group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-accent/60 ${
                p.featured ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
                {p.featured && (
                  <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
                    Featured
                  </span>
                )}
              </div>

              <p className="mt-3 flex-1 leading-relaxed text-muted">{p.blurb}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-5 border-t border-border pt-5 text-sm">
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-medium transition hover:text-accent"
                  >
                    Live demo
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                )}
                {p.code && (
                  <a
                    href={p.code}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-muted transition hover:text-accent"
                  >
                    <Github size={15} />
                    Code
                  </a>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
