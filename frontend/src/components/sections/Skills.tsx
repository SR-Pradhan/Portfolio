import { skills } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";
import TechIcon from "../TechIcon";

export default function Skills() {
  return (
    <Section
      id="skills"
      title="Skills & Expertise"
      sub="The technologies I reach for, from languages to frameworks and tools"
    >
      <div className="space-y-12">
        {skills.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.05}>
            <h3 className="text-xl font-semibold tracking-tight">{group.category}</h3>
            <ul className="mt-5 flex flex-wrap gap-3">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm transition-colors hover:border-accent/60"
                >
                  <TechIcon slug={item.icon} size={17} />
                  {item.name}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
