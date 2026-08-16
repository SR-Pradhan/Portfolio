/**
 * A padlock whose shackle actually swings open, rather than two icons
 * cross-fading. The shackle is its own path pivoting on the base of its
 * right leg, so it hinges the way a real one does.
 *
 * Driven entirely by the parent's `group` hover — no state, no JS.
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
      <g
        // fill-box makes the origin relative to the shackle itself, so it
        // pivots on its own right leg instead of the middle of the canvas
        style={{ transformBox: "fill-box", transformOrigin: "right bottom" }}
        className="transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-[1.5px] group-hover:-rotate-[32deg]"
      >
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </g>

      {/* body gives a tiny recoil as the shackle releases */}
      <g className="transition-transform duration-500 ease-out group-hover:translate-y-[0.5px]">
        <rect x="3.5" y="10" width="17" height="11" rx="2.5" />
        <circle cx="12" cy="15" r="1.15" fill="currentColor" stroke="none" />
        <path d="M12 16.2v1.6" />
      </g>
    </svg>
  );
}
