import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { education, site, skills } from "@/data/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // makes every relative URL below (OG image, canonical) absolute
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.socials.github }],
  creator: site.name,
  keywords: [
    site.name,
    "AI Engineer",
    "Backend Developer",
    "LLM",
    "RAG",
    "LangChain",
    "FastAPI",
    "Spring Boot",
    "Java",
    "Python",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/**
 * Structured data so search engines read this as a person, not a page of
 * text — which is what surfaces a name, job title and social profiles in a
 * knowledge panel rather than a plain blue link.
 */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.initials,
  jobTitle: site.role,
  description: site.tagline,
  email: `mailto:${site.email}`,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: site.location },
  sameAs: Object.values(site.socials).filter(Boolean),
  knowsAbout: skills.flatMap((group) => group.items.map((item) => item.name)),
  alumniOf: education.map((e) => ({
    "@type": "EducationalOrganization",
    name: e.school,
  })),
};

/** Applies the saved theme before first paint so the page never flashes. */
const themeScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(t!=='light')document.documentElement.classList.add('dark');
}catch(e){document.documentElement.classList.add('dark')}})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (Grammarly and friends)
          inject attributes onto body after SSR, which React reports as a
          mismatch. Nothing to do with our markup. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
