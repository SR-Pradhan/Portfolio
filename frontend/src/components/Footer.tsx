import { footer, site } from "@/data/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-10 text-sm text-muted sm:flex-row sm:justify-between sm:gap-6">
        <p>
          {footer.credit}{" "}
          <span className="font-medium text-foreground">{site.name}</span>
          <span aria-hidden className="mx-2 text-border">
            /
          </span>
          <span className="font-mono text-xs">© {year}</span>
        </p>

        {/*
          Words as separate spans with accent dots between them, rather than one
          string with dots typed in. The separators are aria-hidden so a screen
          reader reads three words instead of spelling out punctuation.
        */}
        <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em]">
          {footer.motto.map((word, i) => (
            <span key={word} className="flex items-center gap-2.5">
              {i > 0 && (
                <span aria-hidden className="size-1 rounded-full bg-accent" />
              )}
              {word}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
