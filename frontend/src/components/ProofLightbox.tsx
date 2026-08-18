"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";

/**
 * Full-size viewer for an achievement's proof photos.
 *
 * The hover fan can only ever show the top photo clearly, and on touch there is
 * no hover at all, so without this the second and third photos are unreachable
 * for everyone and all of them are unreachable on a phone.
 */
export default function ProofLightbox({
  photos,
  title,
  index,
  onIndex,
  onClose,
}: {
  photos: string[];
  title: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const count = photos.length;
  const go = useCallback(
    (step: number) => onIndex((index + step + count) % count),
    [index, count, onIndex],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);

    // stop the page scrolling underneath the overlay
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [go, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, photo ${index + 1} of ${count}`}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex animate-[fade-in_0.15s_ease-out_both] flex-col items-center justify-center gap-4 bg-black/85 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-white/50 hover:text-white"
      >
        <X size={18} />
      </button>

      {/* the image itself must not close the overlay when clicked */}
      <div onClick={(e) => e.stopPropagation()} className="relative">
        <Image
          key={photos[index]}
          src={photos[index]}
          alt={`${title}, proof ${index + 1} of ${count}`}
          width={1600}
          height={1200}
          className="max-h-[76vh] w-auto max-w-[92vw] rounded-xl object-contain shadow-2xl"
          priority
        />
      </div>

      {count > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-white/50 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {photos.map((photo, i) => (
              <button
                key={photo}
                onClick={() => onIndex(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Next photo"
            className="grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition hover:border-white/50 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <p className="font-mono text-xs text-white/50">
        {title} · {index + 1} of {count}
      </p>
    </div>
  );
}
