import { GraduationCap, MapPin, Mail } from "lucide-react";
import { about, site } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function About() {
  return (
    <Section id="background" eyebrow="01 / who i am" title={about.heading}>
      <div className="grid gap-14 md:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <p className="text-lg leading-relaxed text-muted">{about.intro}</p>
          <p className="mt-5 text-lg leading-relaxed text-muted">{about.body}</p>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {about.stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-border bg-surface p-7">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Details
            </h3>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-accent" />
                <a href={`mailto:${site.email}`} className="hover:text-accent">
                  {site.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
                <span className="text-muted">{site.location}</span>
              </li>
              <li className="flex gap-3">
                <GraduationCap size={18} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  <span className="block font-medium">{about.education.degree}</span>
                  <span className="block text-muted">{about.education.school}</span>
                  <span className="mt-1 block font-mono text-xs text-muted">
                    {about.education.detail}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
