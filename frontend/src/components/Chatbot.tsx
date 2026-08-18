"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What's he working on?",
  "Tell me about Solvix",
  "What's his AI experience?",
];

const GREETING: Message = {
  role: "assistant",
  content: `Hi! Ask me anything about ${site.shortName}'s work, projects, or background.`,
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [nudged, setNudged] = useState(true); // assume seen until we check
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show the tooltip and pulse only to first-time visitors — a widget that
  // pulses on every page load reads as an ad.
  useEffect(() => {
    setNudged(localStorage.getItem("chat-seen") === "1");
  }, []);

  useEffect(() => {
    if (!open) return;
    setNudged(true);
    localStorage.setItem("chat-seen", "1");
  }, [open]);

  // keep the newest message in view as it streams in
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const history = [...messages, { role: "user" as const, content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // drop the local greeting — the server has its own system prompt
        body: JSON.stringify({ messages: history.slice(1) }),
      });
      if (!res.body) throw new Error("No response body");

      // Server-Sent Events arrive as `data: {...}` blocks separated by a blank
      // line. Chunks can split mid-event, so buffer until a separator appears.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.replace(/^data: /, "").trim();
          if (!line) continue;
          const payload = JSON.parse(line) as {
            text?: string;
            error?: string;
            done?: boolean;
          };
          if (payload.text || payload.error) {
            const chunk = payload.text ?? payload.error ?? "";
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: "assistant",
                content: next[next.length - 1].content + chunk,
              };
              return next;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `Sorry, I couldn't reach the server. You can email ${site.email} instead.`,
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher: a circular icon button, the convention every support widget
          uses — it reads as a utility rather than a marketing CTA, and takes
          the same corner space at any viewport width. */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Ask about Sruti"}
        aria-expanded={open}
        className="group fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-accent text-white shadow-[0_10px_35px_-8px_var(--accent)] transition-transform hover:scale-105 active:scale-95"
      >
        {/* Beacon: two staggered rings pushing outward so the button reads as
            live. Always on (not just first visit) — it's the only cue that the
            corner button does something. */}
        {!open && (
          <>
            <span
              aria-hidden
              className="chat-ping pointer-events-none absolute inset-0 rounded-full border border-accent"
            />
            <span
              aria-hidden
              className="chat-ping-delayed pointer-events-none absolute inset-0 rounded-full border border-accent"
            />
          </>
        )}
        <MessageCircle
          size={22}
          className={`absolute transition-all duration-200 ${
            open ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <X
          size={22}
          className={`absolute transition-all duration-200 ${
            open ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </button>

      {/* Tooltip, not a permanent label — says what the button is once, then
          gets out of the way for good. */}
      {!open && !nudged && (
        <span
          aria-hidden
          className="pointer-events-none fixed bottom-[4.6rem] right-6 z-50 hidden animate-[fade-in_0.4s_ease-out_both] rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted shadow-lg sm:block"
        >
          Ask me about {site.shortName}
        </span>
      )}

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[30rem] animate-[fade-in_0.2s_ease-out_both] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="size-2 rounded-full bg-accent" />
            <p className="text-sm font-medium">Ask about {site.shortName}</p>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-accent text-white"
                    : "bg-background text-muted"
                }`}
              >
                {m.content || <span className="opacity-60">…</span>}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-white transition hover:opacity-90 disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
