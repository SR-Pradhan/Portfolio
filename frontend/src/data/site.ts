/**
 * ─────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit this one file to update the whole portfolio.
 *  Anything marked TODO is placeholder text — replace it.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Sruti Ranjan Pradhan",
  /** Short form used for the logo and the hero greeting. */
  shortName: "SR",
  role: "Full Stack Developer",
  tagline: "I build fast, thoughtful web products — from the database up to the last pixel.",
  location: "India",
  email: "ai.altatech@gmail.com",
  resumeUrl: "/resume.pdf", // TODO: drop your resume.pdf into /public
  avatar: "/avatar.svg", // TODO: replace with your photo, e.g. "/avatar.jpg"
  /** Order here is the order they render. Leave a value "" to hide it. */
  socials: {
    github: "https://github.com/SR-Pradhan", // TODO: confirm
    linkedin: "https://linkedin.com/in/", // TODO
    leetcode: "https://leetcode.com/u/", // TODO
    codolio: "https://codolio.com/profile/", // TODO
  },
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export const about = {
  heading: "About Me",
  sub: "Get to know me better",
  intro:
    "TODO: two or three sentences about who you are and what you like building. Keep it human — this is the part people actually read.",
  body: "TODO: a second paragraph. What you're focused on right now, what you're curious about, what kind of work you want more of.",
  stats: [
    { value: "3+", label: "Years Writing Code" },
    { value: "15+", label: "Projects Shipped" },
    { value: "5+", label: "Open Source Contribs" },
    { value: "8.5", label: "CGPA" },
  ],
};

export type Education = {
  degree: string;
  school: string;
  period: string;
  grade?: string;
  detail?: string;
};

export const education: Education[] = [
  {
    degree: "B.Tech, Computer Science",
    school: "Your University", // TODO
    period: "2021 — 2025",
    grade: "CGPA 8.5 / 10.0",
    detail: "TODO: relevant coursework, a thesis, a club you ran, anything notable.",
  },
  {
    degree: "Senior Secondary (XII), Science",
    school: "Your School", // TODO
    period: "2019 — 2021",
    grade: "92%",
  },
];

export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  demo?: string;
  code?: string;
  npm?: string;
  /** Renders a dimmed teaser card instead of a real one. */
  comingSoon?: boolean;
};

export const projects: Project[] = [
  {
    title: "Project One",
    blurb:
      "TODO: one or two lines on what it does and, more importantly, what was hard about it. Numbers help — users, latency, scale.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
    demo: "#",
    code: "#",
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
    title: "Coming Soon",
    blurb: "Something new is in the works. Check back soon.",
    tags: [],
    comingSoon: true,
  },
];

export const skills = [
  {
    category: "Languages",
    items: [
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Python", icon: "python" },
      { name: "Java", icon: "openjdk" },
      { name: "HTML5", icon: "html5" },
      { name: "CSS3", icon: "css" },
    ],
  },
  {
    category: "Frameworks & Libraries",
    items: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextdotjs" },
      { name: "Node.js", icon: "nodedotjs" },
      { name: "Express", icon: "express" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Motion", icon: "framer" },
      { name: "FastAPI", icon: "fastapi" },
    ],
  },
  {
    category: "Databases",
    items: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MongoDB", icon: "mongodb" },
      { name: "Redis", icon: "redis" },
      { name: "Prisma", icon: "prisma" },
      { name: "Supabase", icon: "supabase" },
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      { name: "Git", icon: "git" },
      { name: "Docker", icon: "docker" },
      { name: "AWS", icon: "amazonwebservices" },
      { name: "Vercel", icon: "vercel" },
      { name: "Linux", icon: "linux" },
      { name: "Figma", icon: "figma" },
      { name: "GraphQL", icon: "graphql" },
    ],
  },
];

export type Job = {
  role: string;
  company: string;
  companyUrl?: string;
  location?: string;
  period: string;
  points: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    role: "Frontend Developer",
    company: "Company Name", // TODO
    companyUrl: "", // optional — adds a link icon next to the name
    location: "Remote", // TODO
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
    location: "Bengaluru", // TODO
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
