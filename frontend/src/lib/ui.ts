"use client";

/**
 * The small amount of cross-component wiring the site needs.
 *
 * The command palette has to reach two things that own their own state and
 * live elsewhere in the tree: the theme (also owned by the header toggle) and
 * the chat launcher. Lifting either into a context or a store would mean a
 * provider around the whole page to serve two events, so they are broadcast on
 * `window` instead — the components that care subscribe, and nothing else has
 * to know the palette exists.
 */

import { useSyncExternalStore } from "react";

export const THEME_CHANGED = "portfolio:theme";
export const OPEN_CHAT = "portfolio:open-chat";
export const OPEN_PALETTE = "portfolio:open-palette";
export const OPEN_TERMINAL = "portfolio:open-terminal";

/** Reads the theme off the class the inline script in layout.tsx already set. */
export function isDark() {
  return document.documentElement.classList.contains("dark");
}

/**
 * The theme as an external store rather than component state.
 *
 * It genuinely is external — the inline script in layout.tsx sets it before
 * React exists, and two components (the header toggle and the palette) can
 * both change it. Subscribing means neither has to sync itself in an effect,
 * and the server snapshot matches that script's default.
 */
export function useIsDark() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(THEME_CHANGED, onChange);
      return () => window.removeEventListener(THEME_CHANGED, onChange);
    },
    isDark,
    () => true,
  );
}

/** Applies a theme, persists it, and tells any listening UI to re-render. */
export function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // private mode with storage blocked: the theme still applies for this page
  }
  window.dispatchEvent(new CustomEvent(THEME_CHANGED, { detail: { dark } }));
}

export function toggleTheme() {
  setTheme(!isDark());
}

export function openChat() {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT));
}

export function openPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE));
}

export function openTerminal() {
  window.dispatchEvent(new CustomEvent(OPEN_TERMINAL));
}

/**
 * Whether the pointer is coarse — a finger rather than a mouse.
 *
 * A media query is external state, so it is subscribed to rather than mirrored
 * into an effect. The server snapshot is `false`: server-rendered markup gets
 * the desktop arrangement, and touch corrects it on hydration, which is the
 * right way round — a phone can scroll a track that was laid out for a mouse,
 * while a mouse cannot swipe one laid out for a finger.
 */
export function useCoarsePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(pointer: coarse)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
}
