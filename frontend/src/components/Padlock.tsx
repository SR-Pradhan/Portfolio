/**
 * A padlock whose shackle actually swings open, rather than two icons
 * cross-fading. The shackle is its own path pivoting on the base of its
 * right leg, so it hinges the way a real one does.
 *
 * The motion lives in globals.css (.padlock-shackle / .padlock-body) —
 * see the note there for why it isn't written as Tailwind utilities.
 * Driven entirely by the parent's `group` hover: no state, no JS.
 */
export default function Padlock({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path className="padlock-shackle" d="M8 10V7a4 4 0 0 1 8 0v3" />
      <g className="padlock-body">
        <rect x="3.5" y="10" width="17" height="11" rx="2.5" />
        <circle cx="12" cy="15" r="1.15" fill="currentColor" stroke="none" />
        <path d="M12 16.2v1.6" />
      </g>
    </svg>
  );
}
