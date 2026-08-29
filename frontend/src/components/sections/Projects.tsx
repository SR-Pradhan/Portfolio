"use client";

import { ArrowUpRight, Package } from "lucide-react";
import { Github } from "@/components/BrandIcons";
import { projects, type Project, projectsMore, site } from "@/data/site";
import { repoSlug, useRepoStats } from "@/hooks/useRepoStats";
import { techEmoji, techSlug } from "@/lib/techSlugs";
import CaseStudy from "../CaseStudy";
import RepoStats from "../RepoStats";
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
      {/* Always rendered, even when empty. Everything below the spacer in a card
          is bottom-anchored, so a note present on one card and absent on its
          neighbour pushes that card's whole footer — buttons, case study, stats
          — a line out of step with the row. Reserving the line costs nothing
          and keeps the grid reading as a grid. */}
      <p className="mt-3 min-h-4 font-mono text-[11px] text-muted/70">{project.demoNote}</p>
    </div>
  );
}

export default function Projects() {
  const real = projects.filter((p) => !p.comingSoon);
  // Live GitHub numbers, fetched once for the whole section rather than per
  // card. Empty until they land — and stays empty if the API is asleep.
  const stats = useRepoStats();

  return (
    <Section id="projects"
      index={2} title="Projects" sub="A selection of my recent work">
      {/* Three widths, not one. A grid of four identical cards gives every
          project the same claim on attention; leading with one full-width card
          says which is the strongest and gives the section a shape. The last
          card widens on md so the second row never ends in an orphan. */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <Reveal
              key={p.title}
              delay={(i % 2) * 0.08}
              className={`h-full ${
                i === 0
                  ? "md:col-span-2 lg:col-span-3"
                  : i === projects.length - 1
                    ? "md:col-span-2 lg:col-span-1"
                    : ""
              }`}
            >
              <SpotlightCard>
                {/* oversized index sitting behind the content as a watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-8 select-none font-mono text-[7rem] font-bold leading-none text-foreground/[0.04]"
                >
                  {String(real.indexOf(p) + 1).padStart(2, "0")}
                </span>

                <div
                  className={`relative z-10 flex h-full flex-col p-7 ${
                    i === 0 ? "lg:p-9" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className={`font-semibold tracking-tight transition-colors group-hover:text-accent ${
                        i === 0 ? "text-2xl lg:text-3xl" : "text-xl"
                      }`}
                    >
                      {p.title}
                    </h3>
                    {p.demo && <LiveBadge />}
                  </div>

                  <p
                    className={`mt-3 leading-relaxed text-muted ${
                      i === 0 ? "lg:max-w-3xl lg:text-lg" : ""
                    }`}
                  >
                    {p.blurb}
                  </p>

                  {p.hardPart && (
                    <div className="hard-part">
                      <div className="border-l-2 border-accent/50 pl-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                          The hard part
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {p.hardPart}
                        </p>
                      </div>
                    </div>
                  )}

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <li
                        key={t}
                        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted transition-colors group-hover:border-accent/30"
                      >
                        {techSlug(t) ? (
                          <TechIcon slug={techSlug(t)} size={12} />
                        ) : techEmoji(t) ? (
                          <span aria-hidden className="text-[12px] leading-none">
                            {techEmoji(t)}
                          </span>
                        ) : null}
                        {t}
                      </li>
                    ))}
                  </ul>

                  {/* The cards in a row are equal height but their content is
                      not, so the slack has to go somewhere. Here rather than
                      above the tags: with the spacer higher up, a card with
                      fewer tag rows opened a visible hole under its blurb,
                      while this keeps blurb and tags reading as one block and
                      still bottom-anchors the stats, case study and links so
                      they line up across the row. */}
                  <div className="flex-1" />

                  {(() => {
                    const live = stats.get(repoSlug(p.code) ?? "");
                    return live ? <RepoStats stats={live} /> : null;
                  })()}

                  <CaseStudy project={p} />

                  <Links project={p} />
                </div>
              </SpotlightCard>
            </Reveal>
          ),
        )}

      </div>

      {/* Deliberately a plain link, not a card. The grid already carries a
          "Coming Soon" tile saying more is on the way, and a second large
          placeholder would say it twice. */}
      <Reveal delay={0.05}>
        <div className="mt-10 flex justify-center">
          <a
            href={site.socials.github}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-1.5 font-mono text-sm text-muted transition-colors hover:text-accent"
          >
            {projectsMore.cta}
            <ArrowUpRight
              size={14}
              className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
