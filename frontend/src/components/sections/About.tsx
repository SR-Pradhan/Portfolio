import { about, site } from "@/data/site";
import Highlighted from "../Highlighted";
import PhotoCarousel from "../PhotoCarousel";
import Reveal from "../Reveal";
import Section from "../Section";

export default function About() {
  return (
    <Section id="about"
      index={1} title={about.heading} sub={about.sub}>
      {/* photo column deliberately narrower than the text: a 5:6 frame at half
          the page width runs ~630px tall and pushes the stats off screen */}
      <div className="grid items-center gap-10 md:grid-cols-[0.7fr_1.3fr]">
        <Reveal>
          <PhotoCarousel photos={about.photos} alt={site.name} />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="leading-7 text-muted">
            <Highlighted text={about.intro} phrases={about.highlights} />
          </p>
          <p className="mt-4 leading-7 text-muted">
            <Highlighted text={about.body} phrases={about.highlights} />
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {about.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-surface px-3 py-4 text-center transition-colors hover:border-accent/60"
              >
                <dt className="text-2xl font-semibold tracking-tight">{s.value}</dt>
                <dd className="mt-1 text-xs leading-tight text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
