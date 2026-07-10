import { cn } from "@/lib/utils"

type GlamzzoMarkProps = {
  className?: string
  size?: number
  inverse?: boolean
}

/**
 * Glammzo brand mark — scissors + comb in a circle medallion (salon / self-care).
 */
export function GlamzzoMark({ className, size = 32, inverse = false }: GlamzzoMarkProps) {
  const id = inverse ? "glamzzo-mark-inv" : "glamzzo-mark"
  const sand = inverse ? "rgba(255,255,255,0.35)" : "#E4DED2"
  const medallion = inverse ? "rgba(255,255,255,0.95)" : "#ffffff"
  const iconFill = inverse ? "#ffffff" : "url(#glamzzo-mark-coral)"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="glamzzo-mark-coral" x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F95C48" />
          <stop offset="1" stopColor="#e84a38" />
        </linearGradient>
        <linearGradient id={`${id}-bg`} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor={inverse ? "rgba(255,255,255,0.18)" : "#F6F4F1"} />
          <stop offset="1" stopColor={inverse ? "rgba(255,255,255,0.08)" : "#ffffff"} />
        </linearGradient>
      </defs>

      {/* Outer tile */}
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${id}-bg)`} />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke={sand} strokeWidth="1" />

      {/* Circle medallion */}
      <circle cx="16" cy="16" r="11.5" fill={medallion} />
      <circle cx="16" cy="16" r="11" stroke={sand} strokeWidth="0.6" fill="none" opacity={inverse ? 0.4 : 0.9} />

      {/* Scissors + comb — unified salon silhouette */}
      <g fill={iconFill}>
        {/* Comb (behind) */}
        <path d="M12.25 10.25h1.85c0 0 .15 11.2.15 11.2h-2c0 0-.15-11.2-.15-11.2z" />
        <path d="M12.55 12.1h1.25v1.05h-1.25V12.1zm0 2.55h1.25v1.05h-1.25v-1.05zm0 2.55h1.25v1.05h-1.25v-1.05zm0 2.55h1.25v1.05h-1.25v-1.05z" opacity="0.92" />

        {/* Scissors blades */}
        <path d="M16 9.35L10.85 15.9l1.05.75L16 11.15l4.1 5.5 1.05-.75L16 9.35z" />
        <path d="M16 10.55a1.05 1.05 0 1 0 0.01 0z" />

        {/* Finger rings */}
        <ellipse cx="11.85" cy="20.35" rx="1.85" ry="2.45" />
        <ellipse cx="20.15" cy="20.35" rx="1.85" ry="2.45" />

        {/* Blade connectors to rings */}
        <path d="M12.55 16.2l-.7 3.2c-.15.7.35 1.35 1.05 1.35h.35c.75 0 1.25-.7 1.05-1.4l-.75-3.15-1 0z" />
        <path d="M19.45 16.2l.7 3.2c.15.7-.35 1.35-1.05 1.35h-.35c-.75 0-1.25-.7-1.05-1.4l.75-3.15 1 0z" />
      </g>
    </svg>
  )
}
