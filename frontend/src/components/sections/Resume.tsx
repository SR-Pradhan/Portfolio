import { FileDown } from "lucide-react";
import { site } from "@/data/site";
import Reveal from "../Reveal";

export default function Resume() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-surface p-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Want the one-page version?
            </h2>
            <p className="mt-2 text-muted">
              Full work history, education, and skills — as a PDF.
            </p>
          </div>
          <a
            href={site.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FileDown size={16} />
            Download resume
          </a>
        </div>
      </Reveal>
    </div>
  );
}
