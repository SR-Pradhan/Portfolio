import { skills } from "@/data/site";
import Reveal from "../Reveal";
import Section from "../Section";
import TechIcon from "../TechIcon";

export default function Skills() {
  return (
    <Section
      id="skills"
      index={3}
      title="Skills & Expertise"
      sub="The technologies I reach for, from languages to frameworks and tools"
    >
      {/* two columns: nine categories stacked would run the section very long */}
      <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
        {skills.map((group, i) => (
          <Reveal
            key={group.category}
            delay={(i % 2) * 0.05}
            className={"featured" in group && group.featured ? "md:col-span-2" : ""}
          >
            <h3 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
              {group.category}
              <span className="h-px flex-1 bg-border" />
            </h3>

            <ul className="mt-4 flex flex-wrap gap-2.5">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm transition-colors hover:border-accent/60"
                >
                  {/* brand mark where one exists, emoji where it doesn't */}
                  {"icon" in item && item.icon ? (
                    <TechIcon slug={item.icon} size={16} />
                  ) : "emoji" in item && item.emoji ? (
                    <span aria-hidden className="text-[15px] leading-none">
                      {item.emoji}
                    </span>
                  ) : null}
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
