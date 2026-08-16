import Image from "next/image";
import { about, site } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function About() {
  return (
    <Section id="about" title={about.heading} sub={about.sub}>
      <div className="grid items-start gap-12 md:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[5/6] overflow-hidden rounded-3xl border border-border bg-surface">
            <Image
              src={site.avatar}
              alt={site.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={false}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-lg leading-relaxed text-muted">{about.intro}</p>
          <p className="mt-5 text-lg leading-relaxed text-muted">{about.body}</p>

          <dl className="mt-10 grid grid-cols-2 gap-4">
            {about.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-surface px-6 py-7 text-center transition-colors hover:border-accent/60"
              >
                <dt className="text-3xl font-semibold tracking-tight">{s.value}</dt>
                <dd className="mt-1.5 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
