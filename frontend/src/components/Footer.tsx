import { footer, site } from "@/data/site";
import { socialLinks } from "@/lib/socials";

/**
 * Centred and stacked rather than a single justified row: a footer is the last
 * thing on the page, and a wide row of small text reads as leftover UI. Four
 * tiers, each one short line, sized to give a clear order to read them in.
 *
 * Both dotted rows are deliberately different weights — the motto's dots are
 * accent, the social row's are muted. Identical separators on adjacent lines
 * make the two rows blur into one texture.
 */
export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-14 text-center">
        {/* Wordmark. The trailing accent dot is the site's own idiom — the nav
            logo and every section heading end the same way. */}
        <p className="font-mono text-2xl font-bold uppercase tracking-[0.2em] text-foreground sm:text-3xl">
          {site.name.split(" ").slice(0, 2).join(" ")}
          <span className="text-accent">.</span>
        </p>

        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          {footer.motto.map((word, i) => (
            <span key={word} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden className="size-1 rounded-full bg-accent" />
              )}
              {word}
            </span>
          ))}
        </p>

        {/* Text labels, not the icon row used in the hero and contact section.
            Same links, different form, so the footer isn't a third copy. */}
        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-[0.16em]">
          {socialLinks.map(({ href, label }, i) => (
            <span key={label} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden className="size-1 rounded-full bg-border" />
              )}
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-muted transition-colors hover:text-accent"
              >
                {label}
              </a>
            </span>
          ))}
        </nav>

        <p className="font-mono text-xs text-muted">
          {footer.credit}{" "}
          <span className="text-foreground">{site.name}</span>
          {/* same blinking block the hero headline uses, so the page opens and
              closes on the same terminal cue */}
          <span
            aria-hidden
            className="caret-blink ml-1.5 inline-block h-3 w-[7px] translate-y-[1px] bg-accent"
          />
          <span aria-hidden className="mx-2 text-border">
            /
          </span>
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
