"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { Project } from "@/data/site";

/**
 * The request path as a small diagram.
 *
 * Chips and arrows rather than boxes and lines: a card is 500px wide and has
 * to work on a phone, where any real diagram would either scroll sideways or
 * shrink past reading size. Wrapping chips degrade to a list on a narrow
 * screen and still read in order.
 */
function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          {i > 0 && (
            <span aria-hidden className="font-mono text-[11px] text-accent/60">
              →
            </span>
          )}
          <span className="rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[10px] text-muted">
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * "Case study" disclosure under a project card.
 *
 * A real button with `aria-expanded`, not a CSS-only hover reveal like the
 * hard-part block above it: this content is long enough that it has to be
 * dismissible, reachable by keyboard, and readable on a phone, and none of
 * those survive a hover trick.
 *
 * The click is stopped from bubbling because the whole card is a spotlight
 * surface that reacts to pointer events — without it, opening the drawer also
 * fires the card's own hover choreography.
 */
export default function CaseStudy({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const study = project.caseStudy;
  if (!study?.notes?.length && !study?.flow?.length) return null;

  return (
    <div className="relative z-10 mt-5 border-t border-border pt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
      >
        <ChevronDown
          size={13}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
        {open ? "Hide case study" : "Case study"}
      </button>

      {/* 0fr → 1fr animates to the content's natural height, which max-height
          cannot do without hardcoding a guess. */}
      <div
        id={panelId}
        className="case-study grid transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-4">
            {study.flow?.length ? (
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  Request path
                </p>
                <Flow steps={study.flow} />
              </div>
            ) : null}

            {study.notes?.length ? (
              <ul className="space-y-2.5">
                {study.notes.map((note) => (
                  <li key={note} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {note}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
