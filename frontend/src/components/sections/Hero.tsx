"use client";

import { motion } from "motion/react";
import { ArrowDown, FileDown, Mail } from "lucide-react";
import { Github, Linkedin } from "@/components/BrandIcons";
import { site } from "@/data/site";

const socialLinks = [
  { href: site.socials.github, icon: Github, label: "GitHub" },
  { href: site.socials.linkedin, icon: Linkedin, label: "LinkedIn" },
  { href: `mailto:${site.email}`, icon: Mail, label: "Email" },
].filter((s) => s.href);

export default function Hero() {
  return (
    <section
      id="home"
      className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 pt-32"
    >
      {/* soft accent glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/4 top-1/4 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 font-mono text-sm text-accent"
      >
        Hi, I&apos;m {site.name.split(" ")[0]} —
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
      >
        {site.role}
        <span className="text-accent">.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
      >
        {site.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
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

        <div className="ml-2 flex items-center gap-4">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="text-muted transition hover:text-accent"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </motion.div>

      <motion.a
        href="#background"
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
