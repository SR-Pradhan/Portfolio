"use client";

import {
  ArrowRight,
  Check,
  Copy,
  CornerDownLeft,
  FileDown,
  MessageSquare,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Github, Linkedin } from "@/components/BrandIcons";
import { nav, projects, site } from "@/data/site";
import { track } from "@/lib/metrics";
import { OPEN_PALETTE, openChat, toggleTheme, useIsDark } from "@/lib/ui";

type Command = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  run: () => void;
  /** Extra words to match on that aren't in the visible label. */
  keywords?: string;
};

/**
 * Three tiers, strongest first: prefix, then contiguous substring, then a
 * subsequence — every typed character in order but not adjacent, the rule
 * editors use, so "expc" still finds "Experience".
 *
 * The tiers matter more than the fuzziness. On a subsequence-only rank, "em"
 * scores "Real-TiME Drowsiness Detection" above "Copy EMail address" purely
 * because its first hit lands earlier in the string, which is the opposite of
 * what was meant. A contiguous run is nearly always the intended match.
 */
function score(query: string, text: string) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 1000;

  const at = t.indexOf(q);
  if (at >= 0) {
    // a run starting a word beats one buried mid-word
    const boundary = at > 0 && /[\s\-/]/.test(t[at - 1]) ? 50 : 0;
    return 700 + boundary - at;
  }

  let qi = 0;
  let first = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (first < 0) first = ti;
      qi++;
    }
  }
  return qi === q.length ? 500 - first : -1;
}

/** Scrolls to a section without fighting the fixed header. */
function goTo(href: string) {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.hash = href;
}

/**
 * ⌘K palette: jump to any section, or fire the handful of actions a visitor
 * actually wants — copy the email, take the résumé, ask the assistant.
 *
 * Worth the code beyond the flourish: it is the only way to reach every part
 * of this site from the keyboard alone, without tabbing through nine nav links
 * and a chat launcher first.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);
  const dark = useIsDark();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked (insecure origin, denied permission): fall back to
      // the mail client, which is what the copy was for anyway
      window.location.href = `mailto:${site.email}`;
    }
  }, []);

  const commands: Command[] = useMemo(() => {
    const sections: Command[] = nav.map((item) => ({
      id: `nav-${item.href}`,
      label: item.label,
      group: "Jump to",
      icon: ArrowRight,
      run: () => goTo(item.href),
    }));

    const repos: Command[] = projects
      .filter((p) => p.code)
      .map((p) => ({
        id: `repo-${p.title}`,
        label: p.title,
        hint: "Open repository",
        group: "Projects",
        icon: Github,
        keywords: p.tags.join(" "),
        run: () => window.open(p.code, "_blank", "noreferrer"),
      }));

    const actions: Command[] = [
      {
        id: "copy-email",
        label: "Copy email address",
        hint: site.email,
        group: "Actions",
        icon: copied ? Check : Copy,
        keywords: "mail contact reach",
        run: copyEmail,
      },
      {
        id: "resume",
        label: "Download résumé",
        group: "Actions",
        icon: FileDown,
        keywords: "cv pdf",
        run: () => {
          track("resume");
          window.open(site.resumeUrl, "_blank", "noreferrer");
        },
      },
      {
        id: "chat",
        label: "Ask the assistant",
        hint: "AI",
        group: "Actions",
        icon: MessageSquare,
        keywords: "chat bot question ai",
        run: openChat,
      },
      {
        id: "theme",
        label: dark ? "Switch to light mode" : "Switch to dark mode",
        group: "Actions",
        icon: dark ? Sun : Moon,
        keywords: "theme dark light appearance",
        run: toggleTheme,
      },
      {
        id: "github",
        label: "GitHub profile",
        group: "Elsewhere",
        icon: Github,
        run: () => window.open(site.socials.github, "_blank", "noreferrer"),
      },
      {
        id: "linkedin",
        label: "LinkedIn profile",
        group: "Elsewhere",
        icon: Linkedin,
        run: () => window.open(site.socials.linkedin, "_blank", "noreferrer"),
      },
    ];

    return [...sections, ...repos, ...actions];
  }, [copied, copyEmail, dark]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return commands;

    const ranked = commands
      .map((c) => ({
        c,
        // a keyword-only hit is real but weaker than one you can see in the label
        s: Math.max(score(q, c.label), score(q, c.keywords ?? "") - 100),
      }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s);

    // Re-block the ranked list by group. Sorting on score alone interleaves
    // groups, which makes the same heading appear two or three times down the
    // list; ordering the groups by their best hit keeps relevance and shows
    // each heading once.
    const groups = new Map<string, Command[]>();
    for (const { c } of ranked) {
      const bucket = groups.get(c.group);
      if (bucket) bucket.push(c);
      else groups.set(c.group, [c]);
    }
    return [...groups.values()].flat();
  }, [commands, query]);

  // ── Open / close ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    // The nav chip is the discoverable half of this: a shortcut nobody knows
    // about is a shortcut nobody uses.
    const onRequest = () => setOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE, onRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE, onRequest);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  // A filtered list can end up shorter than the cursor that was left on it,
  // so the selection is clamped where it is read rather than corrected after
  // the fact — one source of truth, and no extra render to fix it up.
  const selectedIndex = Math.min(cursor, Math.max(results.length - 1, 0));

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  const runAt = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    cmd.run();
    // Copy is the one action worth staying open for — the tick is the only
    // confirmation that it worked.
    if (cmd.id !== "copy-email") close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown" || (e.key === "n" && e.ctrlKey)) {
      e.preventDefault();
      setCursor((selectedIndex + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp" || (e.key === "p" && e.ctrlKey)) {
      e.preventDefault();
      setCursor((selectedIndex - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(selectedIndex);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm"
      />

      <div
        className="palette-panel relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Search sections, projects, actions…"
            aria-label="Search commands"
            className="w-full bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted/70"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-8 text-center font-mono text-xs uppercase tracking-[0.16em] text-muted">
              No matches
            </p>
          )}

          {results.map((cmd, i) => {
            const header = i === 0 || results[i - 1].group !== cmd.group ? cmd.group : null;
            const Icon = cmd.icon;
            const selected = i === selectedIndex;

            return (
              <div key={cmd.id}>
                {header && (
                  <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">
                    {header}
                  </p>
                )}
                <button
                  type="button"
                  data-selected={selected}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => runAt(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selected ? "bg-accent-soft text-accent" : "text-foreground"
                  }`}
                >
                  <Icon size={15} className={selected ? "" : "text-muted"} />
                  <span className="flex-1 truncate">
                    {cmd.id === "copy-email" && copied ? "Copied to clipboard" : cmd.label}
                  </span>
                  {cmd.hint && (
                    <span className="hidden truncate font-mono text-[11px] text-muted sm:block">
                      {cmd.hint}
                    </span>
                  )}
                  {selected && <CornerDownLeft size={13} className="shrink-0" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
