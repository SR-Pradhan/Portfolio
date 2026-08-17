import { Fragment } from "react";

/** Longest first, so "AI APIs" wins over a bare "AI" that overlaps it. */
function byLengthDesc(a: string, b: string) {
  return b.length - a.length;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renders `text` with any occurrence of `phrases` lifted out of the muted body
 * colour into full foreground weight — so a skim-reader picks up the key terms
 * without the paragraph turning into a ransom note.
 *
 * Phrases are matched case-sensitively and literally, not as regex.
 */
export default function Highlighted({
  text,
  phrases,
}: {
  text: string;
  phrases?: string[];
}) {
  if (!phrases?.length) return <>{text}</>;

  const pattern = new RegExp(
    `(${[...phrases].sort(byLengthDesc).map(escapeRegex).join("|")})`,
    "g",
  );
  const parts = text.split(pattern);
  const marked = new Set(phrases);

  return (
    <>
      {parts.map((part, i) =>
        marked.has(part) ? (
          <strong key={i} className="font-medium text-foreground">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
