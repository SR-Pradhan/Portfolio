import { Package, SquareArrowOutUpRight } from "lucide-react";
import { Github } from "@/components/BrandIcons";
import { projects, type Project } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

function LinkRow({ project }: { project: Project }) {
  const links = [
    { href: project.code, icon: Github, label: "Code" },
    { href: project.npm, icon: Package, label: "npm" },
    { href: project.demo, icon: SquareArrowOutUpRight, label: "Live Demo" },
  ].filter((l) => l.href);

  if (!links.length) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-border pt-5 text-sm">
      {links.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 flex items-center gap-2 text-muted transition hover:text-accent"
        >
          <Icon size={15} />
          {label}
        </a>
      ))}
      {project.demoNote && (
        <span className="w-full font-mono text-[11px] text-muted/70">
          {project.demoNote}
        </span>
      )}
    </div>
  );
}

export default function Projects() {
  return (
    <Section id="projects" title="Projects" sub="A selection of my recent work">
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) =>
          p.comingSoon ? (
            <Reveal key={p.title} delay={(i % 2) * 0.08} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-dashed border-border bg-surface/40 p-7 opacity-60">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
                  <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                    Soon
                  </span>
                </div>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{p.blurb}</p>
                <span className="mt-6 w-fit rounded-md border border-border px-3 py-1 font-mono text-xs text-muted">
                  ???
                </span>
              </article>
            </Reveal>
          ) : (
            <Reveal key={p.title} delay={(i % 2) * 0.08} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_12px_40px_-12px_var(--accent)]">
                {/* accent bloom that wakes up on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-accent/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                    {p.title}
                  </h3>
                  <span className="shrink-0 font-mono text-xs text-muted transition-colors group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="relative mt-3 leading-relaxed text-muted">{p.blurb}</p>

                {p.hardPart && (
                  <div className="relative mt-5 rounded-xl border border-border bg-background/50 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      The hard part
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {p.hardPart}
                    </p>
                  </div>
                )}

                <div className="flex-1" />

                <ul className="relative mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-muted transition-colors group-hover:border-accent/40"
                    >
                      {t}
                    </li>
                  ))}
                </ul>

                <div className="relative">
                  <LinkRow project={p} />
                </div>
              </article>
            </Reveal>
          ),
        )}
      </div>
    </Section>
  );
}
