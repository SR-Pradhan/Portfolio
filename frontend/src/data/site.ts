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
  /** What it does. */
  blurb: string;
  /** The technically interesting problem — rendered as its own labelled block. */
  hardPart?: string;
  tags: string[];
  demo?: string;
  /** Caveat shown beside the demo link, e.g. free-tier cold starts. */
  demoNote?: string;
  code?: string;
  npm?: string;
  /** Renders a dimmed teaser card instead of a real one. */
  comingSoon?: boolean;
};

export const projects: Project[] = [
  {
    title: "Solvix",
    blurb:
      "An AI-powered DSA practice tracker that automatically imports your Codeforces and LeetCode history, scores which topics have decayed, and generates a daily study plan with spaced-repetition reminders — no manual logging required.",
    // Long version, kept for interviews: the backend sleeps when idle, so
    // reminders and plan generation run on an external cron rather than an
    // in-process timer; topic scoring treats Codeforces and LeetCode
    // differently since only one records failed attempts; repeated wrong
    // submissions collapse into a single attempt so retry-spam doesn't
    // distort the score.
    hardPart:
      "Free-tier hosting sleeps when idle, so daily plans and reminders run on an external GitHub Actions cron instead of an in-process timer.",
    tags: [
      "FastAPI",
      "async SQLAlchemy",
      "Alembic",
      "PostgreSQL",
      "JWT",
      "React",
      "TypeScript",
      "Vite",
      "Recharts",
      "Groq LLM",
    ],
    code: "https://github.com/SR-Pradhan/Solvix",
    demo: "https://solvix-roan.vercel.app",
    demoNote: "API cold-starts after idle — first request ~50s",
  },
  {
    title: "Real-Time Drowsiness Detection",
    blurb:
      "A computer vision system that monitors a live webcam feed, tracks facial landmarks, and computes Eye Aspect Ratio in real time to detect fatigue — triggering an audio alert when eyes stay closed past a threshold.",
    hardPart:
      "Tuning the EAR threshold and frame count to catch real drowsiness without firing on ordinary blinks, while staying fast enough for live video.",
    tags: ["Python", "OpenCV", "dlib", "imutils", "SciPy", "Streamlit", "pygame"],
    code: "https://github.com/SR-Pradhan/real-time-drowsiness-detection",
  },
  {
    title: "Secure Auth System",
    blurb:
      "A Spring Boot authentication system implementing user registration, login, and role-based access control (USER/ADMIN), with BCrypt password encryption and session-managed protected routes.",
    hardPart:
      "Designing role-based access, BCrypt storage, and session handling into the Spring Security layer from the start, rather than bolting security on afterwards.",
    tags: ["Java", "Spring Boot", "Spring Security", "Thymeleaf", "MySQL", "Maven"],
    code: "https://github.com/SR-Pradhan/secure-auth-system",
  },
  {
    title: "Coming Soon",
    blurb: "Something new is in the works. Check back soon.",
    tags: [],
    comingSoon: true,
  },
];

/**
 * `icon` is a simple-icons slug. Concepts and products with no published
 * brand mark (RAG, OOP, Leadership, ChromaDB, Pinecone, RAGAS…) carry an
 * `emoji` instead, so every chip has a glyph and the rows stay even.
 */
export const skills = [
  {
    category: "Languages",
    items: [
      { name: "Python", icon: "python" },
      { name: "Java", icon: "openjdk" },
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "SQL", emoji: "🗃️" },
    ],
  },
  {
    category: "AI Engineering",
    // spans the full width — it's the category the whole site is aimed at
    featured: true,
    items: [
      { name: "LLM APIs (Groq, OpenAI)", emoji: "🤖" },
      { name: "Prompt Engineering", emoji: "✍️" },
      { name: "RAG", emoji: "🔎" },
      { name: "Embeddings", emoji: "🧬" },
      { name: "LangChain", icon: "langchain" },
      { name: "LangGraph", icon: "langgraph" },
      { name: "AI Agents", emoji: "🕵️" },
      { name: "Multi-Agent Systems", emoji: "🐝" },
      { name: "RAGAS", emoji: "📊" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "FastAPI", icon: "fastapi" },
      { name: "Spring Boot", icon: "springboot" },
      { name: "Spring Security", icon: "springsecurity" },
      { name: "REST APIs", emoji: "🔌" },
      { name: "JWT Auth", icon: "jsonwebtokens" },
      { name: "Alembic", emoji: "🧱" },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "React", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Vite", icon: "vite" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
    ],
  },
  {
    category: "Databases",
    items: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MySQL", icon: "mysql" },
      { name: "ChromaDB", emoji: "🌈" },
      { name: "Pinecone", emoji: "🌲" },
    ],
  },
  {
    category: "Computer Vision",
    items: [
      { name: "OpenCV", icon: "opencv" },
      { name: "dlib", icon: "dlib" },
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      { name: "Git", icon: "git" },
      { name: "GitHub Actions", icon: "githubactions" },
      { name: "Maven", icon: "apachemaven" },
      { name: "Docker", icon: "docker" },
      { name: "Vercel", icon: "vercel" },
      { name: "Render", icon: "render" },
      { name: "Hugging Face", icon: "huggingface" },
    ],
  },
  {
    category: "Core CS",
    items: [
      { name: "OOP", emoji: "🧩" },
      { name: "DBMS", emoji: "🗄️" },
      { name: "Operating Systems", emoji: "🖥️" },
      { name: "Computer Networks", emoji: "🌐" },
      { name: "DSA", emoji: "🧠" },
    ],
  },
  {
    category: "Soft Skills",
    items: [
      { name: "Problem Solving", emoji: "💡" },
      { name: "Technical Communication", emoji: "🗣️" },
      { name: "Team Collaboration", emoji: "🤝" },
      { name: "Leadership", emoji: "🧭" },
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
  /** Certificates, company pages — rendered as a row of small links. */
  links?: { label: string; href: string }[];
};

export const experience: Job[] = [
  {
    role: "Full-Stack Java Developer Intern",
    company: "Delhi Integrated Multi-Modal Transit System Ltd. (DIMTS)",
    companyUrl: "https://www.dimts.in/",
    location: "Delhi, India",
    period: "June 2025 – August 2025",
    points: [
      "Built OnlineQuizWebApp with Java, JSP, Servlets (J2EE), JDBC and SQL Server, following an MVC architecture.",
      "Implemented dynamic quiz workflows, authentication and real-time evaluation with support for concurrent users.",
      "Designed and optimised SQL queries for efficient data retrieval, improving application response time.",
      "Debugged and resolved application-level issues, improving system stability and performance.",
    ],
    stack: [
      "Java",
      "JSP",
      "Servlets",
      "JDBC",
      "SQL Server",
      "MVC",
      "HTML/CSS",
      "JavaScript",
    ],
    links: [
      {
        label: "Certificate & Offer Letter",
        href: "https://drive.google.com/drive/folders/1IAVSg9aG50B2psxdkm8PVCKVenyIPHcb",
      },
      {
        label: "Company LinkedIn",
        href: "https://www.linkedin.com/company/dimts-ltd.-a-jv-of-govt.-of-delhi-and-idfc-/posts/?feedView=all",
      },
      { label: "Company Website", href: "https://www.dimts.in/" },
    ],
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
