"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme, useIsDark } from "@/lib/ui";

export default function ThemeToggle() {
  // Subscribed, not local: the command palette can flip the theme too, and
  // this button has to follow it rather than showing the wrong glyph.
  const dark = useIsDark();

  return (
    <button
      onClick={() => setTheme(!dark)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid size-9 place-items-center rounded-full border border-border text-muted transition hover:border-accent hover:text-accent"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
