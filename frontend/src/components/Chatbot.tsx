"use client";

import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { track } from "@/lib/metrics";
import { OPEN_CHAT } from "@/lib/ui";
import ChatMessage from "./ChatMessage";

/**
 * Chat bubble mark for the launcher.
 *
 * Filled rather than lucide's outline `MessageCircle`: an outline glyph on a
 * solid colour button reads as thin and unfinished at 22px, which is why every
 * shipped chat widget (Intercom, Crisp, Drift) uses a filled bubble.
 *
 * The three dots are holes, not white circles — one path with `evenodd`, so
 * whatever colour the button is shows through. Nothing to keep in sync if the
 * accent changes.
 */
function ChatBubble({ className }: { className?: string }) {
  const dot = (cx: number) =>
    `M${cx - 1.15} 10.05a1.15 1.15 0 1 0 2.3 0a1.15 1.15 0 1 0-2.3 0Z`;

  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d={`M6.5 3.75h11a3.75 3.75 0 0 1 3.75 3.75v5a3.75 3.75 0 0 1-3.75 3.75h-6.4l-3.72 2.98A.85.85 0 0 1 6 18.56V16.2A3.75 3.75 0 0 1 2.75 12.5v-5A3.75 3.75 0 0 1 6.5 3.75Z ${dot(8.4)} ${dot(12)} ${dot(15.6)}`}
      />
    </svg>
  );
}

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

  // The command palette can launch the chat; it has no handle on this state,
  // so it asks on the window instead.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CHAT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT, onOpen);
  }, []);



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
    track("chat");

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // drop the local greeting — the server has its own system prompt
        body: JSON.stringify({ messages: history.slice(1) }),
      });
      /*
        Errors come back as JSON, not SSE: the rate limiter returns 429 and
        validation returns 400, both with a plain body. Feeding those to the
        SSE parser below finds no "\n\n" separator, so nothing is ever emitted
        and the bubble sits on its typing dots forever. Check the status first
        and surface the server's own message.
      */
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
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
      // A stream that closed without ever emitting text would otherwise leave
      // the typing dots running. Nothing else clears them.
      setMessages((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.content) return prev;
        next[next.length - 1] = {
          role: "assistant",
          content: `Sorry, I didn't get a reply. You can email ${site.email} instead.`,
        };
        return next;
      });
    } catch (err) {
      // Prefer the server's message ("Too many messages. Try again later.")
      // over a generic one: a rate-limited visitor should be told to wait
      // rather than be told the site is broken.
      const reason =
        err instanceof Error && err.message
          ? err.message
          : "Sorry, I couldn't reach the server.";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `${reason} You can email ${site.email} instead.`,
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
        onClick={() => {
          setOpen((v) => !v);
          // opening the panel is what "seen" means, so record it here rather
          // than in an effect watching `open`
          setNudged(true);
          localStorage.setItem("chat-seen", "1");
        }}
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
        <ChatBubble
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
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="relative flex size-2">
              <span className="live-ping absolute inline-flex size-full rounded-full bg-accent" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-none">
                Ask about {site.shortName}
              </p>
              {/* say plainly that this is a bot — visitors shouldn't think
                  they're messaging him directly and waiting on a reply */}
              <p className="mt-1 text-[11px] leading-none text-muted">
                AI assistant · answers from his portfolio
              </p>
            </div>
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
                {m.content ? (
                  <ChatMessage content={m.content} />
                ) : (
                  <span className="flex gap-1 py-1" aria-label="Thinking">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="size-1.5 rounded-full bg-muted motion-safe:animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                )}
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
