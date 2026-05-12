type LogoProps = {
  size?: number;
  className?: string;
  withWordmark?: boolean;
};

/**
 * Flag Football Academy logo:
 * - A football (laces) cradled by a tilted flag at the top-left
 * - Single-line geometric, works in monochrome via currentColor
 * - Accent yellow flag for color version
 */
export function Logo({ size = 36, className = "", withWordmark = false }: LogoProps) {
  if (!withWordmark) {
    return (
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className={className}
        role="img"
        aria-label="Flag Football Academy"
        fill="none"
      >
        {/* Flag pole + flag */}
        <path
          d="M14 8 L14 56"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 10 L34 10 L28 18 L34 26 L14 26 Z"
          fill="hsl(48 100% 58%)"
          stroke="hsl(48 100% 58%)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Football */}
        <ellipse
          cx="40"
          cy="40"
          rx="18"
          ry="11"
          transform="rotate(-18 40 40)"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          d="M30 40 H50 M36 35 V45 M40 35 V45 M44 35 V45"
          transform="rotate(-18 40 40)"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="Flag Football Academy">
      <Logo size={size} />
      <div className="font-display leading-none">
        <div className="text-[0.62rem] tracking-[0.32em] text-muted-foreground uppercase font-semibold">
          Flag Football
        </div>
        <div className="text-base font-extrabold tracking-tight">
          ACADEMY <span className="text-primary text-glow-green">•</span>
        </div>
      </div>
    </div>
  );
}
