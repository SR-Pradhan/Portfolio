import Chatbot from "@/components/Chatbot";
import CursorFollower from "@/components/CursorFollower";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import Starfield from "@/components/Starfield";
import About from "@/components/sections/About";
import Achievements from "@/components/sections/Achievements";
import Certifications from "@/components/sections/Certifications";
import Contact from "@/components/sections/Contact";
import Education from "@/components/sections/Education";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Resume from "@/components/sections/Resume";
import Skills from "@/components/sections/Skills";
import { getResume } from "@/lib/resume";

export default function Home() {
  // In production a missing PDF hides the section and the nav button outright,
  // rather than shipping a dead link. In development it stays visible so the
  // section can be worked on before the file exists.
  const showResume =
    getResume().available || process.env.NODE_ENV !== "production";

  return (
    <>
      <Starfield />
      <CursorFollower />
      <SiteChrome resumeReady={showResume} />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Education />
        <Achievements />
        <Certifications />
        {showResume && <Resume />}
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
