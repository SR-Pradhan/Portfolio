"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const INTERVAL_MS = 4000;
const SWIPE_THRESHOLD = 40; // px before a drag counts as a swipe

export type Photo = { src: string; alt?: string };

/**
 * Cross-fading photo frame.
 *
 * Deliberately not hover-to-advance: phones have no hover, so a hover-only
 * carousel would show mobile visitors the first photo and nothing else.
 * Instead it auto-advances, pauses while you're pointing at it, offers dots
 * to jump directly, and accepts swipes on touch.
 *
 * With a single photo it renders as a plain image — no dots, no timer.
 */
export default function PhotoCarousel({
  photos,
  alt,
}: {
  photos: Photo[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const multiple = photos.length > 1;

  const go = useCallback(
    (next: number) => setIndex(((next % photos.length) + photos.length) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (!multiple || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [multiple, paused, photos.length]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) go(index + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  }

  return (
    <div
      className="mx-auto w-full max-w-[300px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="relative aspect-[5/6] overflow-hidden rounded-3xl border border-border bg-surface"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {photos.map((photo, i) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt ?? alt}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            // only the first is eager; the rest load as they come around
            priority={i === 0}
            className={`object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {multiple && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-1.5 bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
