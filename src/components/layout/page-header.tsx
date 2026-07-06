import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <header className={cn("max-w-2xl", className)}>
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h1 className="display-section mt-3">{title}</h1>
      {subtitle ? (
        <p className="mt-3 text-base leading-relaxed text-foreground/65">{subtitle}</p>
      ) : null}
    </header>
  )
}
