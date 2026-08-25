"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { COMMANDS, type Line, run } from "@/lib/shell";
import { OPEN_TERMINAL, openChat, setTheme } from "@/lib/ui";

const PROMPT = "sruti@portfolio ~ %";

const BANNER: Line[] = [
  { text: `${site.name} — portfolio shell`, tone: "accent" },
  { text: "Everything here is read from the same file the page is built from.", tone: "muted" },
  { text: "Type `help` to see what it knows. `exit` closes.", tone: "muted" },
  { text: "" },
];

const TONE: Record<string, string> = {
  accent: "text-accent",
  muted: "text-muted",
  error: "text-red-400",
};

/**
 * A working shell over the site's own content.
 *
 * The whole page already speaks this language — the scroll HUD prints
 * `{home}{about}`, the loading curtain runs a boot log, the type is mono
 * throughout — but none of it does anything. This does: `ls`, `cat`, `open`
 * and `goto` all resolve against site.ts, so the shell can neither describe a
 * project that isn't on the page nor miss one that is.
 *
 * Not a replacement for anything. Every command here has a mouse equivalent
 * elsewhere on the page; this is for the visitor who would rather type.
 */
export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // ── Opening ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Backtick, the key every terminal-in-an-app is opened with. Ignored
      // while typing somewhere else, or the chat input would swallow it.
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "`" && !typing) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onRequest = () => setOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_TERMINAL, onRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_TERMINAL, onRequest);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  // Keep the newest output in view as it prints.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  if (!open) return null;

  const submit = () => {
    const entered = input;
    const echo: Line = { text: `${PROMPT} ${entered}` };
    const { lines: output, effect } = run(entered);

    setInput("");
    if (entered.trim()) {
      setHistory((prev) => [entered, ...prev]);
      setCursor(-1);
    }

    if (effect?.kind === "clear") return setLines([]);

    setLines((prev) => [...prev, echo, ...output, { text: "" }]);

    switch (effect?.kind) {
      case "exit":
        return close();
      case "open":
        return void window.open(effect.url, "_blank", "noreferrer");
      case "goto": {
        close();
        const el = document.querySelector(effect.href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      case "chat":
        close();
        return openChat();
      case "theme":
        return setTheme(effect.dark);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();

    if (e.key === "Enter") {
      e.preventDefault();
      return submit();
    }

    // Shell history: up walks back through what was typed, down returns.
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) {
        setCursor(next);
        setInput(history[next]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setInput(next >= 0 ? history[next] : "");
      return;
    }

    // Tab completes the command word only — enough to make the shell feel
    // real without pretending to know every path.
    if (e.key === "Tab") {
      e.preventDefault();
      const [word, ...rest] = input.split(/\s+/);
      if (rest.length) return;
      const match = COMMANDS.find((c) => c.startsWith(word.toLowerCase()));
      if (match) setInput(match + " ");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
    >
      <button
        type="button"
        aria-label="Close terminal"
        onClick={close}
        className="absolute inset-0 cursor-default bg-background/80 backdrop-blur-sm"
      />

      <div
        className="terminal-window relative flex h-full max-h-[34rem] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Title bar. The three dots are the one piece of skeuomorphism here —
            they say "terminal" faster than any label could. */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 font-mono text-[11px] text-muted">
            {site.initials.toLowerCase()}@portfolio — zsh
          </span>
          <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ESC
          </kbd>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed sm:text-[13px]"
        >
          {lines.map((line, i) => (
            <p
              key={i}
              className={`whitespace-pre-wrap break-words ${TONE[line.tone ?? ""] ?? "text-foreground"}`}
            >
              {line.text || " "}
            </p>
          ))}

          <div className="flex items-baseline gap-2">
            <span className="shrink-0 text-accent">{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
              className="w-full flex-1 bg-transparent text-foreground caret-accent outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
