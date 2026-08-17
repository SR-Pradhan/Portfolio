/**
 * ─────────────────────────────────────────────────────────────
 *  ALL SITE CONTENT LIVES HERE.
 *  Edit this one file to update the whole portfolio.
 *  Anything marked TODO is placeholder text — replace it.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Sruti Ranjan Pradhan",
  /** Used for the nav logo and the hero greeting. */
  shortName: "Sruti Ranjan",
  /** Initials — for tight spaces like the orbit core, where the full name won't fit. */
  initials: "SR",
  /** Primary title — used in the page <title> and OG tags. */
  role: "AI Engineer",
  /** Cycled through by the hero headline, in this order. */
  roles: ["AI Engineer", "Backend Developer", "Problem Solver", "DSA Enthusiast"],
  tagline:
    "Aspiring AI Engineer with a backend development foundation, solving real-world problems through code.",
  location: "Gurugram, India",
  email: "pradhansr2003@gmail.com",
  resumeUrl: "/resume.pdf", // TODO: drop resume.pdf into /public
  /** Order here is the order they render. Leave a value "" to hide it. */
  socials: {
    github: "https://github.com/SR-Pradhan",
    linkedin: "https://www.linkedin.com/in/sruti-ranjan/",
    leetcode: "https://leetcode.com/u/SR_Pradhan/",
    codolio: "https://codolio.com/profile/SR-Pradhan",
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
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export const about = {
  heading: "About Me",
  sub: "Get to know me better",
  intro:
    "I'm a Computer Science & Engineering student focused on AI Engineering, with a strong backend foundation in Java and Spring Boot. I'm building toward becoming an AI Engineer who can design, develop, and deploy practical AI-powered products, not just experiment with models.",
  body: "Right now, I'm deepening my skills in AI engineering, LLMs, AI APIs, intelligent workflows, and backend system design while continuing to strengthen my DSA and software engineering fundamentals. I'm particularly interested in building production-oriented AI applications where strong backend architecture and AI capabilities work together to solve real problems.",
  /**
   * Phrases lifted out of the muted body text into full foreground weight,
   * so the paragraphs stay scannable. Matched literally and case-sensitively.
   * Keep this short — highlighting everything highlights nothing.
   */
  highlights: [
    "AI Engineering",
    "Java and Spring Boot",
    "design, develop, and deploy",
    "AI-powered products",
    "LLMs",
    "AI APIs",
    "intelligent workflows",
    "backend system design",
    "DSA",
    "production-oriented AI applications",
  ],
  /**
   * About-section photo frame. One entry renders as a plain image; two or
   * more turn it into an auto-advancing carousel with dots and swipe.
   * Add files to /public and list them here, in display order.
   */
  photos: [
    { src: "/avatar.webp", alt: "Sruti Ranjan Pradhan" },
    // { src: "/photo-hackathon.webp", alt: "Presenting at ..." },
    // { src: "/photo-team.webp", alt: "With the team at ..." },
  ],
  stats: [
    { value: "9.51", label: "CGPA" },
    { value: "1", label: "Industry Internship" },
    { value: "8+", label: "Projects Built" },
    { value: "5+", label: "Years Writing Code" },
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
  org: string;
  detail: string;
  year: string;
  /** Proof shown on the opposite side of the rail when the card is hovered. */
  photo?: string;
  /** Teaser shown before hover. */
  hint?: string;
  /** Payoff shown during hover. */
  reveal?: string;
};

export const achievements: Achievement[] = [
  {
    title: "Hackathon Winner",
    org: "Host Organisation", // TODO
    detail: "TODO: which track, out of how many teams, what you built.",
    year: "2025",
    photo: "/proof-placeholder.svg", // TODO: swap for the real photo
    hint: "🤫 Please don't hover your mouse onto this",
    reveal: "Aha! You discovered the win! 🎉",
  },
  {
    title: "Runner-up — Some Competition",
    org: "Host Organisation", // TODO
    detail: "TODO: what you built and why it placed.",
    year: "2025",
    photo: "/proof-placeholder.svg", // TODO
    hint: "🤫 nothing to see here",
    reveal: "Caught me. Second place! 🥈",
  },
  {
    title: "Open Source Contributor",
    org: "Project Name", // TODO
    detail: "TODO: merged PRs, a library you maintain, stars.",
    year: "2024",
    hint: "🤫 seriously, don't",
    reveal: "Fine, you found it 🙌",
  },
];

export type Certification = {
  title: string;
  issuer: string;
  year: string;
  /** simple-icons slug for the issuer, e.g. "postman", "coursera", "google". */
  icon?: string;
  url?: string;
};

export const certifications: Certification[] = [
  {
    title: "API Fundamentals Student Expert", // TODO
    issuer: "Postman", // TODO
    year: "2025",
    icon: "postman",
    url: "", // optional — links the row to the credential
  },
  {
    title: "Certification Name", // TODO
    issuer: "Coursera", // TODO
    year: "2024",
    icon: "coursera",
  },
  {
    title: "Certification Name", // TODO
    issuer: "freeCodeCamp", // TODO
    year: "2024",
    icon: "freecodecamp",
  },
];

export const contact = {
  heading: "Say hi, don't be shy",
  sub: "Got a role, a project, or just want to talk shop? My inbox is open.",
};
