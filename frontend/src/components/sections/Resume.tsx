import { Download, ExternalLink, FileText } from "lucide-react";
import { site } from "@/data/site";
import { getResume } from "@/lib/resume";
import Reveal from "../Reveal";
import Section from "../Section";

/**
 * The resume section: an inline preview plus the two things anyone actually
 * wants, a download and a full-tab view.
 *
 * The PDF is embedded rather than only linked because a recruiter deciding
 * whether you are worth a reply will skim it, and making that a download makes
 * it a decision. The preview is desktop-only: mobile browsers render embedded
 * PDFs inconsistently, and a broken grey box is worse than a clean button.
 */
export default function Resume() {
  const resume = getResume();

  if (!resume.available) {
    // Only ever reached in development — page.tsx drops the whole section in
    // production when the file is missing, so visitors never meet this.
    return (
      <Section id="resume" title="Resume" sub="The one-page version">
        <Reveal>
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <FileText className="mx-auto text-muted" size={28} />
            <p className="mt-4 font-medium">No resume.pdf yet</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Drop the file at{" "}
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs text-accent">
                frontend/public/resume.pdf
              </code>{" "}
              and this section fills itself in. Nothing else to change.
            </p>
            <p className="mt-4 font-mono text-xs text-muted">
              This placeholder is hidden in production.
            </p>
          </div>
        </Reveal>
      </Section>
    );
  }

  return (
    <Section id="resume" title="Resume" sub="The one-page version">
      <Reveal>
        <div className="mx-auto max-w-3xl">
          {/* A4 is 1:1.414, so the frame matches the page and the preview never
              letterboxes inside its own border */}
          <div className="hidden aspect-[1/1.414] overflow-hidden rounded-2xl border border-border bg-surface md:block">
            <object
              data={`${site.resumeUrl}#toolbar=0&navpanes=0`}
              type="application/pdf"
              className="size-full"
              aria-label={`${site.name} resume preview`}
            >
              {/* shown only if the browser refuses to embed PDFs */}
              <div className="grid size-full place-items-center p-8 text-center text-sm text-muted">
                Your browser can&apos;t preview PDFs here. Use the buttons below.
              </div>
            </object>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.resumeUrl}
              download
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Download size={16} />
              Download PDF
            </a>
            <a
              href={site.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              <ExternalLink size={16} />
              Open in new tab
            </a>
          </div>

          <p className="mt-4 text-center font-mono text-xs text-muted">
            PDF · {resume.sizeKB} KB · updated {resume.updated}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
