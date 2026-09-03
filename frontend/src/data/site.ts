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
  /**
   * Canonical origin, used for OG tags, sitemap and JSON-LD.
   *
   * Set NEXT_PUBLIC_SITE_URL in the deploy environment; the fallback only
   * matters for local builds, which still need absolute URLs. It points at the
   * live domain rather than an old Vercel subdomain — the previous fallback
   * (`sruti-ranjan.vercel.app`) now 404s, and a canonical tag aimed at a dead
   * URL is worse than none, which is exactly the bug that once shipped.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.srutiranjanpradhan.online",
  location: "Gurugram, India",
  /** Where the marker sits on the contact map. Gurugram, Haryana. */
  coords: { lat: 28.4595, lng: 77.0266 },
  /** IANA zone, for the local-time readout beside the map. */
  timezone: "Asia/Kolkata",
  email: "pradhansr2003@gmail.com",
  /** Display form. `tel:` links strip the spaces at the call site. */
  phone: "+91 8249809895",
  resumeUrl: "/resume.pdf",
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
  location?: string;
  period: string;
  grade?: string;
  detail?: string;
};

/** Reverse chronological: most recent first. */
export const education: Education[] = [
  {
    degree: "B.Tech, Computer Science and Engineering",
    school: "GD Goenka University",
    location: "Gurugram, Haryana",
    period: "2023 – Present",
    grade: "CGPA 9.51",
  },
  {
    degree: "Class XII, CHSE",
    school: "FM Higher Secondary School",
    location: "Balasore, Odisha",
    period: "2019 – 2021",
  },
  {
    degree: "Class X, BSE",
    school: "SR Bidyapitha",
    location: "Bhograi, Balasore, Odisha",
    period: "2016 – 2019",
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
  /**
   * The deep dive behind the card, opened by "Case study".
   *
   * `notes` is the long version — the decisions worth explaining in an
   * interview. `flow` is the request path, rendered as a small diagram; keep
   * it to four or five steps, since it is a shape to grasp at a glance rather
   * than an architecture document.
   */
  caseStudy?: { notes?: string[]; flow?: string[] };
  /** Renders a dimmed teaser card instead of a real one. */
  comingSoon?: boolean;
};

export const projects: Project[] = [
  {
    title: "AI Microservice Architect",
    blurb:
      "Describe a system in plain English and get an architecture you can ship: service boundaries, high and low level design, database schemas, Kafka contracts, Docker and Kubernetes manifests, and a downloadable repo scaffold. A staged pipeline, not a one-shot generator \u2014 every stage is reviewed, edited and approved before the next one runs.",
    hardPart:
      "Schema-valid output can still be wrong, so every stage is checked against the ones before it and contradictions are fed back to the model for repair \u2014 a design that invents a service the approved boundaries never had is perfectly valid JSON.",
    tags: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Alembic",
      "Pydantic",
      "Gemini",
      "React",
      "TypeScript",
      "Kafka",
      "Docker",
      "Kubernetes",
    ],
    caseStudy: {
      notes: [
        "A stage physically cannot run until the one before it is approved. Service boundaries are architectural judgement calls, so a wrong split at stage one would carry into every artifact after it.",
        "Cross-stage validation catches what Pydantic cannot: a service invented or silently dropped against the approved boundaries, or a synchronous call to an endpoint no service actually exposes.",
        "A stage takes 30 to 200 seconds, so progress is shown against a measured typical duration for that stage rather than a spinner, and says so when the model is probably retrying after a failed check.",
        "The theme resolves to a concrete value before first paint, and Mermaid diagrams are re-rendered on theme change because Mermaid bakes its colours into the SVG.",
        "87 tests cover the pipeline, the consistency checks and the export.",
      ],
      flow: [
        "Plain-English brief",
        "Service boundaries",
        "HLD / LLD",
        "Schemas + Kafka",
        "Docker / K8s",
        "Repo scaffold",
      ],
    },
    code: "https://github.com/SR-Pradhan/AI-Microservice-Architect",
    demoNote: "Runs locally; no hosted demo yet",
  },
  {
    title: "Solvix",
    blurb:
      "An AI-powered DSA practice tracker that automatically imports your Codeforces and LeetCode history, scores which topics have decayed, and generates a daily study plan with spaced-repetition reminders. No manual logging required.",
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
    caseStudy: {
      notes: [
        "The backend sleeps when idle, so reminders and plan generation run on an external cron rather than an in-process timer.",
        "Topic scoring treats Codeforces and LeetCode differently, since only one of them records failed attempts.",
        "Repeated wrong submissions collapse into a single attempt, so retry-spam doesn't distort the score.",
      ],
      flow: ["GitHub Actions cron", "FastAPI", "PostgreSQL", "Groq LLM", "Daily plan"],
    },
    code: "https://github.com/SR-Pradhan/Solvix",
    demo: "https://solvix-roan.vercel.app",
    demoNote: "API cold-starts after idle (first request ~50s)",
  },
  {
    title: "Emergency Ambulance Route Optimizer",
    blurb:
      "A dispatch system that answers two questions from a patient's location: which hospital they should go to, and the fastest road route there. It then sends the nearest available ambulance and tracks it live on an OpenStreetMap network.",
    hardPart:
      "Edge weights are travel time rather than distance, so a congested shortcut loses to a clear detour — on the demo network a 3.9km direct route is rejected for an 8.4km one that is genuinely faster.",
    tags: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "SQLAlchemy",
      "React",
      "Vite",
      "Leaflet",
      "OpenStreetMap",
      "Dijkstra",
      "A*",
    ],
    caseStudy: {
      notes: [
        "Dijkstra, A*, the min-heap ranking and the triage queue are written from scratch — no networkx, no shortest-path library.",
        "A* is measurably cheaper on the same route: 286 node expansions against Dijkstra's 379 on the 433-junction network, which /route?algo=compare reports directly.",
        "Hospital ranking balances distance against capacity — a hospital with no spare beds is ranked as if it were three minutes further, enough to break ties but never enough to send a patient past a much closer one.",
        "Triage cannot starve anyone: severity sets your place in the queue, and every ten minutes of waiting improves it by a full level.",
        "An ambulance's position is derived from elapsed time along its computed route, so it needs no background job and survives a restart.",
      ],
      flow: ["Patient location", "Hospital ranking", "A* over OSM graph", "Dispatch", "Live tracking"],
    },
    code: "https://github.com/SR-Pradhan/Ambulance-Router",
    demo: "https://ambulance-router.vercel.app",
    demoNote: "Traffic, beds and ambulances are simulated",
  },
  {
    title: "Real-Time Drowsiness Detection",
    blurb:
      "A computer vision system that monitors a live webcam feed, tracks facial landmarks, and computes Eye Aspect Ratio in real time to detect fatigue, triggering an audio alert when eyes stay closed past a threshold.",
    hardPart:
      "Tuning the EAR threshold and frame count to catch real drowsiness without firing on ordinary blinks, while staying fast enough for live video.",
    tags: ["Python", "OpenCV", "dlib", "imutils", "SciPy", "Streamlit", "pygame"],
    caseStudy: {
      // TODO: add `notes` — the decisions you'd talk through in an interview.
      flow: ["Webcam frame", "dlib landmarks", "Eye Aspect Ratio", "Threshold + frame count", "pygame alert"],
    },
    code: "https://github.com/SR-Pradhan/real-time-drowsiness-detection",
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
      { name: "Java", icon: "java" },
      { name: "Python", icon: "python" },
      { name: "SQL", emoji: "🗃️" },
      { name: "JavaScript", icon: "javascript" },
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
      { name: "Postman", icon: "postman" },
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
  /** Internship, Leadership… — rendered as a small badge beside the role. */
  kind?: string;
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
    kind: "Internship",
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
  {
    role: "President",
    kind: "Leadership",
    company: "Cybernautics Tech Club, GD Goenka University",
    location: "Gurugram, Haryana, India",
    period: "2024 – 2025",
    points: [
      "Led the Cybernautics Tech Club, coordinating technical initiatives, workshops and student-focused technology activities.",
      "Organised and led SyntaxSprint\u201925, a technical hackathon with 100+ participants, owning event planning, coordination and execution.",
      "Collaborated with student teams and club members to promote hands-on learning, coding and participation in technical events.",
      "Managed a student technical community and coordinated with faculty and organisers to execute club activities effectively.",
    ],
    stack: [
      "Leadership",
      "Event Management",
      "Team Management",
      "Technical Coordination",
      "Hackathon Organization",
      "Community Building",
    ],
  },
];

export type Achievement = {
  title: string;
  org: string;
  detail: string;
  year: string;
  /**
   * Proof shown on the opposite side of the rail when the card is hovered.
   * Two or three fan out as a stack; the first is the one on top, so lead with
   * the strongest shot. Beyond three the fan stops reading and just looks
   * cluttered, so extras are ignored.
   */
  photos?: string[];
  /** Teaser shown before hover. */
  hint?: string;
  /** Payoff shown during hover. */
  reveal?: string;
};

export const achievements: Achievement[] = [
  {
    title: "4th of 130 teams at Nexify\u201925",
    org: "ZENITH, Sushant University",
    detail:
      "Built DoCure.ai, an AI-powered health assistant, with a four-person team. I owned the pitch, turning our scope into the presentation the judges actually scored.",
    year: "2025",
    photos: [
      "/proof/nexify/1-739dcd84.webp",
      "/proof/nexify/2-d220d4c0.webp",
      // Last on purpose: this is a *participation* certificate, so it backs the
      // dates and the organiser rather than the placement. Leading with it
      // would undercut the 4th-of-130 claim in the heading.
      "/proof/nexify/3-8d360a10.webp",
    ],
    hint: "\ud83e\udd2b 130 teams. Don\u2019t look.",
    reveal: "4th place. \ud83c\udfc6",
  },
  {
    title: "Organised SyntaxSprint\u201925",
    org: "Cybernautics Tech Club, GD Goenka University",
    detail:
      "Ran a pan-India hackathon for 100+ participants, from planning through run-of-show on the day.",
    year: "2025",
    photos: ["/proof/syntaxsprint/1-4767b0e7.webp", "/proof/syntaxsprint/2-0ce65112.webp"],
    hint: "\ud83e\udd2b Nothing happening here.",
    reveal: "100+ participants, one weekend. \ud83d\ude80",
  },
  {
    title: "2nd Prize at the 1st Pay-Check Challenge",
    org: "Sunstone",
    detail:
      "Fresh Fuel, a Shopify storefront concept. I handled wireframing, the SRS, branding and product listings. Best E-commerce Website, \u20b93,000.",
    year: "2025", // TODO: confirm the year
    photos: ["/proof/paycheck/1-5afb4915.webp"],
    hint: "\ud83e\udd2b Seriously, move along.",
    reveal: "Second place, and a cheque. \ud83e\udd48",
  },
  {
    title: "Organised Python Workshop 1.0 & 2.0",
    org: "Sunstone",
    detail:
      "Ran two editions of a hands-on Python workshop for B.Tech, BBA and MBA students, pitching the same material at very different levels of prior experience.",
    year: "2024",
    photos: [
      "/proof/python-workshop/1-6f8c785d.webp",
      "/proof/python-workshop/2-e0cceb7b.webp",
      "/proof/python-workshop/3-2b55a58f.webp",
    ],
    hint: "\ud83e\udd2b Definitely nothing here.",
    reveal: "Two editions, three degree programmes. \ud83d\udc0d",
  },
  {
    title: "300+ Coding Problems Solved",
    org: "LeetCode \u00b7 GeeksforGeeks \u00b7 HackerRank",
    photos: ["/proof/dsa/1-c5d27f2f.webp"],
    detail:
      "Consistent DSA practice across three platforms. It\u2019s the habit behind the problem-solving the rest of this page is built on.",
    year: "Ongoing",
    hint: "\ud83e\udd2b Okay, fine, one more.",
    reveal: "300+ and counting. \ud83d\udcaa",
  },
];

export type Certification = {
  title: string;
  issuer: string;
  year: string;
  /**
   * How the issuer is identified on the card, in order of preference:
   *
   * 1. `logo` — a file in `public/logos/`, for issuers simple-icons doesn't
   *    carry. Take it from the issuer's own favicon or press kit; don't redraw
   *    a mark by hand.
   * 2. `icon` — a simple-icons slug ("udemy", "coursera", "edx",
   *    "greatlearning"), drawn in the brand's own colour.
   * 3. Neither — the card falls back to the issuer's initial.
   */
  icon?: string;
  logo?: string;
  /** simple-icons slug for what the course was about — drawn large and faint
      behind the card, the way the timelines carry a year. */
  tech?: string;
  url?: string;
  /** Scan of the certificate. Opens full-size when the card is clicked. */
  image?: string;
};

export const certifications: Certification[] = [
  {
    title: "Basics of Python - Part II",
    issuer: "Code360 by Coding Ninjas",
    year: "2026",
    icon: "codingninjas",
    tech: "python",
    image: "/certificates/python-code360-part2/1-40cc0849.webp",
  },
  {
    title: "Basics of Python - Part I",
    issuer: "Code360 by Coding Ninjas",
    year: "2026",
    icon: "codingninjas",
    tech: "python",
    image: "/certificates/python-code360-part1/1-93801d04.webp",
  },
  {
    title: "Python Course for Beginners: Mastering the Essentials",
    issuer: "Scaler",
    year: "2026",
    tech: "python",
    // Scaler's own cube mark, taken from their favicon — simple-icons has no
    // entry for them (its "scalar" is a different company).
    logo: "/logos/scaler.png",
    image: "/certificates/python-scaler/1-20cf0aa6.webp",
  },
  {
    title: "Programming For Beginners: Master the C Language",
    issuer: "Udemy",
    year: "2023",
    icon: "udemy",
    tech: "c",
    image: "/certificates/c-language/1-2cae510e.webp",
  },
];

/** Quiet link under the Projects grid. The "Coming Soon" card already says more
 *  is on the way, so this only needs to point at the rest of the work. */
export const projectsMore = { cta: "See more on GitHub" };

/** Trailing tile in the Certifications track. Set `show: false` when nothing is pending. */
export const certificationsMore = {
  show: true,
  label: "More in progress",
  detail: "Currently working towards further certifications.",
};

/**
 * Footer. The motto renders as words separated by accent dots, so keep it to
 * three or four short words — more and it stops reading as a motto and starts
 * reading as a sentence someone broke up.
 *
 * Verbs stay in the same form ("build", not "built"): a mixed series reads as a
 * typo rather than a rhythm.
 */
export const footer = {
  credit: "Designed & built by",
  motto: ["think", "research", "build"],
};

export const contact = {
  heading: "Say hi, don't be shy",
  sub: "Got a role, a project, or just want to talk shop? My inbox is open.",
};
