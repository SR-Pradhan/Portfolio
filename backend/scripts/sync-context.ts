/**
 * Generates the chatbot's knowledge base from the frontend's site.ts.
 *
 * site.ts is the single source of truth for site content, so the bot reads
 * from it rather than keeping a second hand-written copy that would silently
 * drift every time the portfolio is edited.
 *
 * Run: npm run sync:context   (from backend/)
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  about,
  achievements,
  certifications,
  education,
  experience,
  projects,
  site,
  skills,
} from "../../frontend/src/data/site.js";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "src", "data");
const outFile = join(outDir, "portfolio-context.json");

const context = {
  generatedAt: new Date().toISOString(),
  identity: {
    name: site.name,
    roles: site.roles,
    tagline: site.tagline,
    location: site.location,
    email: site.email,
    socials: site.socials,
  },
  about: { intro: about.intro, body: about.body, stats: about.stats },
  skills: skills.map((g) => ({
    category: g.category,
    items: g.items.map((i) => i.name),
  })),
  projects: projects
    .filter((p) => !p.comingSoon)
    .map((p) => ({
      title: p.title,
      what: p.blurb,
      hardPart: p.hardPart,
      // The case-study notes are the deepest thing written about a project, so
      // withholding them would leave the assistant answering more shallowly
      // than the page it sits on.
      notes: p.caseStudy?.notes,
      flow: p.caseStudy?.flow,
      tech: p.tags,
      code: p.code,
      demo: p.demo,
    })),
  experience: experience.map((j) => ({
    role: j.role,
    company: j.company,
    location: j.location,
    period: j.period,
    highlights: j.points,
    tech: j.stack,
  })),
  education: education.map((e) => ({
    degree: e.degree,
    school: e.school,
    location: e.location,
    period: e.period,
    grade: e.grade,
  })),
  achievements: achievements.map((a) => ({
    title: a.title,
    org: a.org,
    year: a.year,
    detail: a.detail,
  })),
  certifications: certifications.map((c) => ({
    title: c.title,
    issuer: c.issuer,
    year: c.year,
  })),
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(context, null, 2));

console.log(`Wrote ${outFile}`);
console.log(
  `  ${context.projects.length} projects, ${context.experience.length} roles, ` +
    `${context.skills.length} skill groups`,
);
