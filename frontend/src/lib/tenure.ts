const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** "June 2025" → {y: 2025, m: 5}; "2024" → {y: 2024, m: 0}; "Present" → today. */
function parse(part: string): { y: number; m: number } | null {
  const text = part.trim().toLowerCase();
  if (!text) return null;
  if (text === "present" || text === "now" || text === "current") {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  }

  const withMonth = text.match(/^([a-z]+)\s+(\d{4})$/);
  if (withMonth) {
    const m = MONTHS.findIndex((name) => name.startsWith(withMonth[1].slice(0, 3)));
    if (m >= 0) return { y: Number(withMonth[2]), m };
  }

  const yearOnly = text.match(/^(\d{4})$/);
  if (yearOnly) return { y: Number(yearOnly[1]), m: 0 };

  return null;
}

/**
 * How long a role lasted, worked out from the period string already on the
 * page.
 *
 * Derived rather than stored, so a period that changes cannot disagree with a
 * duration someone forgot to update — the same reason the résumé's problem
 * count lives in one place. Anything it can't parse returns null and the UI
 * simply doesn't show a duration, which is the right failure: a wrong tenure on
 * a CV is worse than no tenure.
 */
export function tenure(period: string): { label: string; current: boolean } | null {
  const [rawStart, rawEnd] = period.split(/[–—-]/);
  if (!rawEnd) return null;

  const start = parse(rawStart);
  const end = parse(rawEnd);
  if (!start || !end) return null;

  const current = /present|now|current/i.test(rawEnd);
  const monthsGiven = /[a-z]/i.test(rawStart.trim());

  // A year-only range says nothing about months, so it is reported in years
  // rather than inventing a precision the source doesn't have.
  if (!monthsGiven) {
    const years = Math.max(1, end.y - start.y);
    return { label: `${years} yr${years > 1 ? "s" : ""}`, current };
  }

  const months = (end.y - start.y) * 12 + (end.m - start.m) + 1;
  if (months < 1) return null;
  if (months < 12) return { label: `${months} mo${months > 1 ? "s" : ""}`, current };

  const years = Math.floor(months / 12);
  const rest = months % 12;
  return {
    label: `${years} yr${years > 1 ? "s" : ""}${rest ? ` ${rest} mo${rest > 1 ? "s" : ""}` : ""}`,
    current,
  };
}
