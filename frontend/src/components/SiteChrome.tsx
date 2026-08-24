"use client";

import { useMemo } from "react";
import { nav } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import CommandPalette from "./CommandPalette";
import Nav from "./Nav";
import ScrollHUD from "./ScrollHUD";

/**
 * Owns the "which section am I in" state and shares it between the
 * scroll HUD and the pill nav, so they always agree.
 */
export default function SiteChrome() {
  const ids = useMemo(() => nav.map((n) => n.href.slice(1)), []);
  const active = useActiveSection(ids);

  return (
    <>
      <ScrollHUD active={active} />
      <Nav active={active} />
      <CommandPalette />
    </>
  );
}
