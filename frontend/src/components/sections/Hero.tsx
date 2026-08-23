"use client";

import { motion } from "motion/react";
import { ArrowDown, FileDown } from "lucide-react";
import { site } from "@/data/site";
import { opensInNewTab, socialLinks } from "@/lib/socials";
import RotatingRole from "@/components/RotatingRole";
import TechOrbit from "@/components/TechOrbit";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 pt-32"
    >
      {/* soft accent glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-1/4 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-accent/[0.05] blur-[120px] dark:bg-accent/15"
      />

      <div className="grid items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 font-mono text-lg text-muted sm:text-xl"
          >
            {/* Three tiers, three treatments: muted for the throwaway words,
                accent for the name, white for the headline below. The name was
                white before, which made it read as a shrunken copy of the H1
                rather than as its own line. */}
            Hi, I&apos;m{" "}
            <span className="font-semibold text-accent">{site.name}</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            // min-height reserves the space the longest role needs, so the
            // text below doesn't jump as characters are typed and deleted
            className="max-w-4xl min-h-[2.1em] text-5xl font-semibold leading-[1.05] tracking-tight md:min-h-[1.05em] md:text-6xl"
          >
            <RotatingRole roles={site.roles} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            {site.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#contact"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Get in touch
            </a>
            <a
              href={site.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              <FileDown size={16} />
              Resume
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 flex items-center gap-3"
          >
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                {...(opensInNewTab(href)
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                aria-label={label}
                title={label}
                className="group grid size-11 place-items-center rounded-full border border-border text-muted transition hover:border-accent hover:text-accent"
              >
                <Icon size={19} />
              </a>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center md:-translate-y-10 md:justify-end md:pr-0 lg:-mr-8"
        >
          <TechOrbit />
        </motion.div>
      </div>

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-6 flex items-center gap-2 font-mono text-xs text-muted transition hover:text-accent"
      >
        <ArrowDown size={14} className="animate-bounce" />
        scroll
      </motion.a>
    </section>
  );
}
