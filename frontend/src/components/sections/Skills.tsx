import { skills } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";

export default function Skills() {
  return (
    <Section id="skills" eyebrow="03 / toolkit" title="Skills">
      <div className="space-y-10">
        {skills.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.05}>
            <div className="grid gap-4 border-t border-border pt-7 md:grid-cols-[200px_1fr]">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {group.category}
              </h3>
              <ul className="flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
