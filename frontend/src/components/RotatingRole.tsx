"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 65; // per character while typing
const DELETE_MS = 30; // per character while deleting
const HOLD_MS = 1900; // pause on a complete word
const GAP_MS = 350; // pause after deleting, before the next word

/**
 * Types each role out, holds, deletes, moves to the next — with a blinking
 * caret standing in for the headline's usual accent full stop.
 *
 * Under prefers-reduced-motion it renders the first role statically: a
 * headline that retypes itself forever is exactly what that setting is for.
 */
export default function RotatingRole({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced || !roles.length) return;

    const word = roles[index];

    // finished typing → hold, then start deleting
    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), HOLD_MS);
      return () => clearTimeout(t);
    }

    // finished deleting → advance to the next word
    if (deleting && text === "") {
      const t = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % roles.length);
      }, GAP_MS);
      return () => clearTimeout(t);
    }

    const t = setTimeout(
      () => {
        setText((prev) =>
          deleting ? word.slice(0, prev.length - 1) : word.slice(0, prev.length + 1),
        );
      },
      deleting ? DELETE_MS : TYPE_MS,
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, roles, reduced]);

  if (reduced) {
    return (
      <>
        {roles[0]}
        <span className="text-accent">.</span>
      </>
    );
  }

  return (
    <>
      {/* full role list for screen readers and crawlers, since the visible
          text is only ever a fragment mid-animation */}
      <span className="sr-only">{roles.join(", ")}</span>
      <span aria-hidden>
        {text}
        <span className="caret-blink font-normal text-accent">|</span>
      </span>
    </>
  );
}
