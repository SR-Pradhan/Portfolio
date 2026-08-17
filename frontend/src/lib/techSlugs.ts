/**
 * Maps a human-readable tech tag to its simple-icons slug.
 *
 * Anything missing here (or missing from simple-icons — Alembic, Recharts,
 * pygame and Groq have no published marks) simply renders without an icon.
 * Lookup is case-insensitive.
 */
const SLUGS: Record<string, string> = {
  // languages
  java: "openjdk",
  python: "python",
  typescript: "typescript",
  javascript: "javascript",
  "c++": "cplusplus",
  sql: "mysql",
  html5: "html5",
  css3: "css",

  // backend
  fastapi: "fastapi",
  "spring boot": "springboot",
  "spring security": "springsecurity",
  "async sqlalchemy": "sqlalchemy",
  sqlalchemy: "sqlalchemy",
  "node.js": "nodedotjs",
  express: "express",
  jwt: "jsonwebtokens",
  thymeleaf: "thymeleaf",

  // data
  postgresql: "postgresql",
  mysql: "mysql",
  mongodb: "mongodb",
  redis: "redis",
  prisma: "prisma",
  supabase: "supabase",

  // frontend
  react: "react",
  "next.js": "nextdotjs",
  vite: "vite",
  "tailwind css": "tailwindcss",
  tailwind: "tailwindcss",
  motion: "framer",

  // ai / cv
  opencv: "opencv",
  dlib: "dlib",
  scipy: "scipy",
  numpy: "numpy",
  streamlit: "streamlit",

  // tooling
  git: "git",
  docker: "docker",
  maven: "apachemaven",
  vercel: "vercel",
  linux: "linux",
  figma: "figma",
  graphql: "graphql",
  "github actions": "githubactions",
};

export function techSlug(tag: string): string | undefined {
  return SLUGS[tag.toLowerCase()];
}

/**
 * Emoji stand-ins for tech with no published brand mark, so every chip
 * carries a glyph and rows stay evenly aligned. Mirrors the approach used
 * for skills. Lookup is case-insensitive.
 */
const EMOJIS: Record<string, string> = {
  jsp: "📄",
  servlets: "🧩",
  jdbc: "🔗",
  "sql server": "🗄️",
  mvc: "🏛️",
  "html/css": "🎨",
  sql: "🗃️",
  "rest apis": "🔌",
  alembic: "🧱",
  jwt: "🔐",
  "async sqlalchemy": "🧬",
  recharts: "📊",
  "groq llm": "🤖",
  pygame: "🎮",
  imutils: "🛠️",
};

export function techEmoji(tag: string): string | undefined {
  return EMOJIS[tag.toLowerCase()];
}
