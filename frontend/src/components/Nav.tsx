"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { nav, site } from "@/data/site";
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
      <nav className="w-full max-w-5xl rounded-2xl border border-border bg-surface/80 shadow-lg backdrop-blur-xl md:w-auto md:rounded-full">
        <div className="flex items-center gap-2 px-4 py-2 md:gap-4 md:px-5">
          <a href="#home" className="text-lg font-bold tracking-tight">
            {site.shortName}
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

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <a
              href={site.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden text-sm font-medium text-accent transition hover:opacity-80 sm:inline-block"
            >
              Resume
            </a>
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
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-accent"
            >
              Resume
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}
