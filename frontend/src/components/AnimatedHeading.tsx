"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Section heading that reveals a word at a time as it scrolls into view.
 *
 * Each word sits in its own clipping box and slides up from underneath, which
 * reads as the line being uncovered rather than as text sliding around the
 * page. Per word, not per letter: nine headings on one page means letter
 * staggering would spend the whole scroll animating, and long words fall apart
 * into confetti.
 *
 * The text is still rendered in the HTML, so it is there for search engines and
 * for anyone who never triggers the animation.
 */
export default function AnimatedHeading({
  title,
  sub,
  index,
}: {
  title: string;
  sub?: string;
  /** Position in the page, printed as an eyebrow above the title. */
  index?: number;
}) {
  const reduced = useReducedMotion();
  const words = title.split(" ");

  return (
    <div className="mb-12 text-center">
      {/* An eyebrow number, the way a magazine numbers its chapters. Nine
          headings that differ only in their wording read as a list; a running
          count tells the visitor where they are in the argument and how much
          is left. Padded to two digits so the column never shifts. */}
      {index !== undefined && (
        <motion.p
          initial={reduced ? undefined : { opacity: 0 }}
          whileInView={reduced ? undefined : { opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-4 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-muted"
        >
          <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-border" />
          {String(index).padStart(2, "0")}
          <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-border" />
        </motion.p>
      )}
      <motion.h2
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-80px" }}
        className="text-4xl font-semibold tracking-tight md:text-5xl"
      >
        {words.map((word, i) => (
          <Fragment key={i}>
            {/*
              A real space, not a margin. Spacing the words with CSS leaves the
              text node reading "AboutMe.", which is what gets copied, read
              aloud by a screen reader, and indexed.
            */}
            {i > 0 && " "}
            <span
              /*
                The mask. `pb`/`-mb` of 0.14em give descenders (the g in
                "Engineering") room to exist before the overflow clips them,
                without adding visible height to the line.
              */
              className="inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]"
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: reduced ? { opacity: 0 } : { y: "110%", opacity: 0 },
                  shown: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.6,
                      delay: reduced ? 0 : i * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                {word}
                {/* the accent stop rides the final word so it can never wrap
                    onto a line of its own */}
                {i === words.length - 1 && (
                  <span className="text-accent">.</span>
                )}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </motion.h2>

      {sub && (
        <motion.p
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          // starts as the last word lands, so the pair reads as one movement
          transition={{ duration: 0.5, delay: reduced ? 0 : words.length * 0.07 }}
          className="mt-4 text-lg text-muted"
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}
