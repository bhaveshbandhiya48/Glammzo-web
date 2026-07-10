import { cn } from "@/lib/utils"

type IconProps = { className?: string }

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 8.5H15V5.8c-.26-.02-.9-.08-1.84-.08-1.86 0-3.13 1.13-3.13 3.2v2.58H8v3h2.03v7.5h3.47v-7.5H16l.4-3h-2.47V9.1c0-.88.24-1.48 1.52-1.48z" />
    </svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.3 4h3.2l-7 8.01L21.5 20h-6.1l-4.78-6.24L5.4 20H2.2l7.48-8.55L2.5 4h6.26l4.32 5.71L17.3 4zm-1.12 14.4h1.77L7.96 5.55H6.08l10.1 12.85z" />
    </svg>
  )
}

export type SocialLink = {
  label: string
  href: string
  icon: "instagram" | "facebook" | "x"
}

const iconMap = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  x: XIcon,
} as const

export function SocialIconLink({
  link,
  className,
}: {
  link: SocialLink
  className?: string
}) {
  const Icon = iconMap[link.icon]

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Follow Glammzo on ${link.label}`}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-background/15 bg-background/5 text-background/60 transition-colors",
        "hover:border-primary/35 hover:bg-primary/10 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground",
        className
      )}
    >
      <Icon className="size-[1.05rem]" />
    </a>
  )
}
