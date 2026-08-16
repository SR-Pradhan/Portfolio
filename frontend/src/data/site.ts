/**
 * ─────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit this one file to update the whole portfolio.
 *  Anything marked TODO is placeholder text — replace it.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Sruti Ranjan Pradhan",
  role: "Full Stack Developer",
  tagline: "I build fast, thoughtful web products — from the database up to the last pixel.",
  location: "India",
  email: "ai.altatech@gmail.com",
  resumeUrl: "/resume.pdf", // TODO: drop your resume.pdf into /public
  avatar: "/avatar.jpg", // TODO: drop your photo into /public
  socials: {
    github: "https://github.com/", // TODO
    linkedin: "https://linkedin.com/in/", // TODO
    leetcode: "https://leetcode.com/", // TODO
    twitter: "", // optional — leave "" to hide
  },
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "Background", href: "#background" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export const about = {
  heading: "Background",
  intro:
    "TODO: two or three sentences about who you are and what you like building. Keep it human — this is the part people actually read.",
  body: "TODO: a second paragraph. What you're focused on right now, what you're curious about, what kind of work you want more of.",
  stats: [
    { value: "3+", label: "Years writing code" },
    { value: "15+", label: "Projects shipped" },
    { value: "5+", label: "Open source contribs" },
  ],
  education: {
    degree: "B.Tech, Computer Science", // TODO
    school: "Your University", // TODO
    detail: "CGPA 8.5 / 10.0 · 2021 – 2025", // TODO
  },
};

export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  demo?: string;
  code?: string;
  image?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "Project One",
    blurb:
      "TODO: one or two lines on what it does and, more importantly, what was hard about it. Numbers help — users, latency, scale.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
    demo: "#",
    code: "#",
    featured: true,
  },
  {
    title: "Project Two",
    blurb: "TODO: what it does and the interesting technical bit.",
    tags: ["React", "Node.js", "Redis"],
    demo: "#",
    code: "#",
  },
  {
    title: "Project Three",
    blurb: "TODO: what it does and the interesting technical bit.",
    tags: ["Python", "FastAPI", "Docker"],
    code: "#",
  },
  {
    title: "Project Four",
    blurb: "TODO: what it does and the interesting technical bit.",
    tags: ["React Native", "Expo", "Supabase"],
    code: "#",
  },
];

export const skills = [
  {
    category: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Java", "SQL"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "Motion", "HTML5", "CSS3"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "FastAPI", "REST", "GraphQL", "Prisma"],
  },
  {
    category: "Data",
    items: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
  },
  {
    category: "Tools & Cloud",
    items: ["Git", "Docker", "AWS", "Vercel", "Linux", "Figma"],
  },
];

export type Job = {
  role: string;
  company: string;
  period: string;
  points: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    role: "Frontend Developer",
    company: "Company Name", // TODO
    period: "Jan 2025 — Present",
    points: [
      "TODO: what you owned. Start with a verb, end with an outcome.",
      "TODO: a second bullet — ideally with a measurable result.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    role: "Software Engineering Intern",
    company: "Company Name", // TODO
    period: "Jun 2024 — Dec 2024",
    points: [
      "TODO: what you built or fixed.",
      "TODO: impact — perf, adoption, bugs closed.",
    ],
    stack: ["React", "Node.js", "MongoDB"],
  },
];

export type Achievement = {
  title: string;
  detail: string;
  year: string;
  /** Playful text shown on hover — set to "" to disable for one item. */
  secret?: string;
};

export const achievements: Achievement[] = [
  {
    title: "Hackathon Winner",
    detail: "TODO: which hackathon, which track, out of how many teams.",
    year: "2025",
    secret: "🤫 you weren't supposed to hover this",
  },
  {
    title: "Runner-up — Some Competition",
    detail: "TODO: what you built and why it placed.",
    year: "2025",
    secret: "still hovering? bold.",
  },
  {
    title: "Certification",
    detail: "TODO: issuer and what it covered.",
    year: "2024",
  },
  {
    title: "Open Source",
    detail: "TODO: merged PRs, a library you maintain, stars.",
    year: "2024",
    secret: "ok now you're just curious",
  },
];

export const contact = {
  heading: "Say hi, don't be shy",
  sub: "Got a role, a project, or just want to talk shop? My inbox is open.",
};
