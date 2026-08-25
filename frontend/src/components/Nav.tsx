"use client";

import { Command, FileDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { nav, site } from "@/data/site";
import { track } from "@/lib/metrics";
import { openPalette, openTerminal } from "@/lib/ui";
import ThemeToggle from "./ThemeToggle";

/**
 * Floating pill nav that sits below the scroll HUD. The section currently
 * in view gets a filled chip so you always know where you are.
 */
export default function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 top-11 z-40 flex justify-center px-4">
      {/* hugs its content on desktop rather than stretching across the page */}
      <nav className="w-full max-w-full rounded-2xl border border-border bg-surface/80 shadow-lg backdrop-blur-xl md:w-auto md:rounded-full">
        <div className="flex items-center gap-2 px-4 py-2 md:gap-4 md:px-6">
          {/* initials, not the full name — the pill is already carrying
              nine links, Resume and the theme toggle */}
          <a href="#home" className="text-lg font-bold tracking-tight">
            {site.initials}
            <span className="text-accent">.</span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const isActive = item.href === `#${active}`;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-accent-soft font-medium text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            {/* an action, not a section — so it gets a button, not link styling */}
            <a
              href={site.resumeUrl}
              onClick={() => track("resume")}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-accent/50 px-3.5 py-1.5 text-sm font-medium text-accent transition hover:bg-accent hover:text-on-accent sm:inline-flex"
            >
              <FileDown size={14} />
              Resume
            </a>
            {/* Discoverability for ⌘K. Only from xl up: below that the pill is
                already carrying nine links, Resume and the toggle, and this is
                the one control that has a keyboard route without it. */}
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open command palette"
              className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted transition hover:border-accent hover:text-accent xl:inline-flex"
            >
              <Command size={11} />K
            </button>
            {/* The shell's only visible handle. It opens on a backtick, which
                nobody discovers on their own, and living solely inside ⌘K makes
                it a secret behind a secret. */}
            <button
              type="button"
              onClick={openTerminal}
              aria-label="Open terminal"
              title="Open terminal (`)"
              className="hidden items-center rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted transition hover:border-accent hover:text-accent xl:inline-flex"
            >
              &gt;_
            </button>
            <ThemeToggle />
            <button
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border px-4 py-2 md:hidden">
            {nav.map((item) => {
              const isActive = item.href === `#${active}`;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-accent-soft font-medium text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href={site.resumeUrl}
              onClick={() => track("resume")}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-accent/50 px-3 py-2.5 text-sm font-medium text-accent"
            >
              <FileDown size={14} />
              Resume
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}
