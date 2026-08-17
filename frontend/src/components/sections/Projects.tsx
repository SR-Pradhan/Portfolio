import { ArrowUpRight, Package } from "lucide-react";
import { Github } from "@/components/BrandIcons";
import { projects, type Project } from "@/data/site";
import { techSlug } from "@/lib/techSlugs";
import Reveal from "../Reveal";
import Section from "../Section";
import SpotlightCard from "../SpotlightCard";
import TechIcon from "../TechIcon";

function LiveBadge() {
  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
      <span className="relative flex size-1.5">
        <span className="live-ping absolute inline-flex size-full rounded-full bg-accent" />
        <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
      </span>
      Live
    </span>
  );
}

function Links({ project }: { project: Project }) {
  const links = [
    { href: project.code, icon: Github, label: "Code" },
    { href: project.npm, icon: Package, label: "npm" },
    { href: project.demo, icon: ArrowUpRight, label: "Live Demo" },
  ].filter((l) => l.href);

  if (!links.length) return null;

  return (
    <div className="relative z-10 mt-6 border-t border-border pt-5">
      <div className="flex flex-wrap items-center gap-3">
        {links.map(({ href, icon: Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
          >
            <Icon size={14} />
            {label}
          </a>
        ))}
      </div>
      {project.demoNote && (
        <p className="mt-3 font-mono text-[11px] text-muted/70">{project.demoNote}</p>
      )}
    </div>
  );
}

export default function Projects() {
  const real = projects.filter((p) => !p.comingSoon);

  return (
    <Section id="projects" title="Projects" sub="A selection of my recent work">
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) =>
          p.comingSoon ? (
            <Reveal key={p.title} delay={(i % 2) * 0.08} className="h-full">
              <article className="flex h-full flex-col items-start justify-center rounded-2xl border border-dashed border-border bg-surface/30 p-7">
                <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  Soon
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-muted">
                  {p.title}
                </h3>
                <p className="mt-2 max-w-xs leading-relaxed text-muted/70">{p.blurb}</p>
              </article>
            </Reveal>
          ) : (
            <Reveal key={p.title} delay={(i % 2) * 0.08} className="h-full">
              <SpotlightCard>
                {/* oversized index sitting behind the content as a watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-8 select-none font-mono text-[7rem] font-bold leading-none text-foreground/[0.04]"
                >
                  {String(real.indexOf(p) + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10 flex h-full flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                      {p.title}
                    </h3>
                    {p.demo && <LiveBadge />}
                  </div>

                  <p className="mt-3 leading-relaxed text-muted">{p.blurb}</p>

                  {p.hardPart && (
                    <div className="mt-5 border-l-2 border-accent/50 pl-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                        The hard part
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {p.hardPart}
                      </p>
                    </div>
                  )}

                  <div className="flex-1" />

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <li
                        key={t}
                        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted transition-colors group-hover:border-accent/30"
                      >
                        <TechIcon slug={techSlug(t)} size={12} />
                        {t}
                      </li>
                    ))}
                  </ul>

                  <Links project={p} />
                </div>
              </SpotlightCard>
            </Reveal>
          ),
        )}
      </div>
    </Section>
  );
}
