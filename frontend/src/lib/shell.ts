"use client";

import {
  about,
  achievements,
  certifications,
  education,
  experience,
  projects,
  site,
  skills,
} from "@/data/site";

export type Line = { text: string; tone?: "accent" | "muted" | "error" };

export type ShellEffect =
  | { kind: "clear" }
  | { kind: "exit" }
  | { kind: "goto"; href: string }
  | { kind: "open"; url: string }
  | { kind: "chat" }
  | { kind: "theme"; dark: boolean }
  | { kind: "copy"; text: string };

export type ShellResult = { lines: Line[]; effect?: ShellEffect };

/** A project's shell name: "Real-Time Drowsiness Detection" → "drowsiness-detection". */
export function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/real-time /, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const real = () => projects.filter((p) => !p.comingSoon);

/**
 * The tree `ls` walks and `cat` reads.
 *
 * Everything resolves out of site.ts, so the shell cannot describe a project
 * that isn't on the page or miss one that is — the same reason the chatbot's
 * knowledge base is generated rather than written.
 */
const DIRS: Record<string, () => string[]> = {
  "": () => ["about", "projects/", "skills", "experience", "education", "awards", "certs", "contact"],
  projects: () => real().map((p) => `${slug(p.title)}/`),
  skills: () => skills.map((g) => g.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
};

const bullet = (text: string): Line => ({ text: `  • ${text}` });
const head = (text: string): Line => ({ text, tone: "accent" });
const blank: Line = { text: "" };

function projectFile(name: string, part?: string): Line[] | null {
  const project = real().find((p) => slug(p.title) === name);
  if (!project) return null;

  if (part === "hard-part") {
    return project.hardPart ? [{ text: project.hardPart }] : [{ text: "Nothing recorded.", tone: "muted" }];
  }
  if (part === "notes") {
    const notes = project.caseStudy?.notes;
    return notes?.length ? notes.map(bullet) : [{ text: "No notes yet.", tone: "muted" }];
  }

  const lines: Line[] = [head(project.title), blank, { text: project.blurb }];
  if (project.hardPart) {
    lines.push(blank, { text: "the hard part", tone: "muted" }, { text: project.hardPart });
  }
  lines.push(blank, { text: `stack   ${project.tags.join(", ")}`, tone: "muted" });
  if (project.code) lines.push({ text: `code    ${project.code}`, tone: "muted" });
  if (project.demo) lines.push({ text: `demo    ${project.demo}`, tone: "muted" });
  if (project.caseStudy?.notes?.length) {
    lines.push(blank, { text: `${name}/notes has the long version`, tone: "muted" });
  }
  return lines;
}

const FILES: Record<string, () => Line[]> = {
  about: () => [head("about"), blank, { text: about.intro }, blank, { text: about.body }],
  skills: () =>
    skills.flatMap((group) => [
      { text: group.category, tone: "accent" as const },
      { text: `  ${group.items.map((i) => i.name).join(", ")}` },
      blank,
    ]),
  experience: () =>
    experience.flatMap((job) => [
      head(`${job.role} — ${job.company}`),
      { text: `  ${job.period}${job.location ? ` · ${job.location}` : ""}`, tone: "muted" as const },
      ...job.points.map(bullet),
      blank,
    ]),
  education: () =>
    education.flatMap((e) => [
      head(e.degree),
      { text: `  ${e.school} · ${e.period}${e.grade ? ` · ${e.grade}` : ""}`, tone: "muted" as const },
      blank,
    ]),
  awards: () =>
    achievements.map((a) => ({ text: `  • ${a.title} — ${a.org} (${a.year})` })),
  certs: () => certifications.map((c) => ({ text: `  • ${c.title} — ${c.issuer}` })),
  contact: () => [
    head("contact"),
    blank,
    { text: `email     ${site.email}` },
    { text: `phone     ${site.phone}` },
    { text: `location  ${site.location}` },
    blank,
    { text: "`open email` to write, `open github` for the code.", tone: "muted" },
  ],
};

const TARGETS: Record<string, string> = {
  github: site.socials.github,
  linkedin: site.socials.linkedin,
  leetcode: site.socials.leetcode,
  codolio: site.socials.codolio,
  resume: site.resumeUrl,
  email: `mailto:${site.email}`,
};

/**
 * The words a visitor is likely to type on their own, mapped to what the shell
 * actually calls them.
 */
const ALIASES: Record<string, string> = {
  achievements: "awards",
  awards: "awards",
  certifications: "certs",
  certificates: "certs",
  work: "experience",
  jobs: "experience",
  study: "education",
  school: "education",
  stack: "skills",
  tech: "skills",
  bio: "about",
  me: "about",
  email: "contact",
  project: "projects",
};

const HELP: Line[] = [
  head("commands"),
  blank,
  { text: "  ls [dir]        list what's here" },
  { text: "  cat <file>      read it — try `cat about` or `cat projects/solvix`" },
  { text: "  open <target>   github · linkedin · leetcode · resume · email · a project" },
  { text: "  goto <section>  scroll the page to a section" },
  { text: "  whoami          the short version" },
  { text: "  ask             open the AI assistant" },
  { text: "  theme [dark|light]" },
  { text: "  clear           wipe the scrollback" },
  blank,
  { text: "  a bare word works too — `education`, `skills`, `solvix`", tone: "muted" },
  { text: "  exit            close the terminal" },
  blank,
  { text: "↑ ↓ history · tab completes · esc closes", tone: "muted" },
];

export const COMMANDS = [
  "ls", "cat", "open", "goto", "whoami", "ask", "theme", "help", "clear", "exit", "contact",
];

/**
 * Runs one line of input.
 *
 * Pure: it returns the output and, where a command has to touch the page, a
 * description of what should happen. The component decides how to carry that
 * out, which keeps every command testable as plain data in and data out.
 */
export function run(input: string): ShellResult {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const arg = args.join(" ").toLowerCase();

  switch (cmd.toLowerCase()) {
    case "help":
    case "?":
      return { lines: HELP };

    case "ls": {
      const dir = arg.replace(/\/$/, "");
      const listing = DIRS[dir];
      if (!listing) return { lines: [{ text: `ls: no such directory: ${arg}`, tone: "error" }] };
      return { lines: [{ text: `  ${listing().join("    ")}` }] };
    }

    case "cat": {
      if (!arg) return { lines: [{ text: "cat: which file? try `ls`", tone: "error" }] };
      const path = arg.replace(/^\.?\//, "").replace(/\/$/, "");
      const [first, second] = path.split("/");

      if (first === "projects" && second) {
        const found = projectFile(second);
        if (found) return { lines: found };
      }
      if (FILES[first] && !second) return { lines: FILES[first]() };

      const direct = projectFile(first, second);
      if (direct) return { lines: direct };

      return { lines: [{ text: `cat: no such file: ${arg}`, tone: "error" }] };
    }

    case "open": {
      if (TARGETS[arg]) return { lines: [{ text: `opening ${arg}…`, tone: "muted" }], effect: { kind: "open", url: TARGETS[arg] } };
      const project = real().find((p) => slug(p.title) === arg);
      const url = project?.demo ?? project?.code;
      if (url) return { lines: [{ text: `opening ${arg}…`, tone: "muted" }], effect: { kind: "open", url } };
      return { lines: [{ text: `open: don't know "${arg}"`, tone: "error" }] };
    }

    case "goto": {
      const section = arg.replace(/^#/, "");
      if (!section) return { lines: [{ text: "goto: which section?", tone: "error" }] };
      return { lines: [{ text: `scrolling to ${section}…`, tone: "muted" }], effect: { kind: "goto", href: `#${section}` } };
    }

    case "whoami":
      return {
        lines: [
          head(site.name),
          { text: `  ${site.role} · ${site.location}` },
          { text: `  ${site.tagline}`, tone: "muted" },
        ],
      };

    case "contact":
      return { lines: FILES.contact() };

    case "ask":
      return { lines: [{ text: "opening the assistant…", tone: "muted" }], effect: { kind: "chat" } };

    case "theme": {
      if (arg && arg !== "dark" && arg !== "light") {
        return { lines: [{ text: "theme: dark or light", tone: "error" }] };
      }
      const dark = arg ? arg === "dark" : !document.documentElement.classList.contains("dark");
      return { lines: [{ text: `theme → ${dark ? "dark" : "light"}`, tone: "muted" }], effect: { kind: "theme", dark } };
    }

    case "clear":
      return { lines: [], effect: { kind: "clear" } };

    case "exit":
    case "quit":
      return { lines: [], effect: { kind: "exit" } };

    // Worth one line of fun, and it tells you something true about the site.
    case "sudo":
      return { lines: [{ text: "nice try — this shell has no write access, only my CV.", tone: "muted" }] };

    case "":
      return { lines: [] };

    default: {
      // A bare noun is what everyone actually types first — `education`, not
      // `cat education`. A real shell would refuse, but this one exists to be
      // explored, and refusing the most natural input teaches nothing. Nouns
      // resolve to the file or listing they obviously mean.
      const noun = ALIASES[cmd.toLowerCase()] ?? cmd.toLowerCase();

      if (noun === "projects") {
        return {
          lines: [
            { text: `  ${DIRS.projects().join("    ")}` },
            { text: "`cat <name>` for one of them.", tone: "muted" },
          ],
        };
      }
      if (FILES[noun]) return { lines: FILES[noun]() };

      const asProject = projectFile(noun, args[0]?.toLowerCase());
      if (asProject) return { lines: asProject };

      return { lines: [{ text: `${cmd}: command not found — try \`help\``, tone: "error" }] };
    }
  }
}
