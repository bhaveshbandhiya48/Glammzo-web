import Link from "next/link"

import type { Category } from "@/types/landing"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CategoryImage } from "@/components/shared/category-image"

type CategoryStackCardProps = {
  category: Category
  index: number
  total: number
}

export function CategoryStackCard({ category, index, total }: CategoryStackCardProps) {
  return (
    <article
      className={cn(
        "services-stack-card overflow-hidden rounded-[1.75rem] border border-border/70",
        category.variant === "sand"
          ? "bg-[color-mix(in_oklab,var(--glam-sand)_48%,var(--glam-bg))]"
          : "bg-card"
      )}
    >
      <div className="flex flex-col md:min-h-[400px] md:flex-row md:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col justify-between p-8 sm:p-10 md:max-w-[48%] md:p-12">
          <div>
            <div className="flex items-center gap-3">
              <p className="meta-label">{category.eyebrow}</p>
              <span className="text-xs font-medium tabular-nums text-foreground/30">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
              {category.title}
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-foreground/65">
              {category.description}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5">
              {category.services.map((service) => (
                <li
                  key={service}
                  className="text-sm text-foreground/55 before:mr-1.5 before:content-['·']"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
          <Button asChild className="mt-8 w-fit rounded-full px-6">
            <Link href={`/explore?category=${category.id}`}>Browse {category.eyebrow}</Link>
          </Button>
        </div>

        <div className="services-stack-media relative aspect-[5/4] w-full min-h-0 shrink-0 overflow-hidden md:aspect-auto md:min-h-[400px] md:flex-1 md:self-stretch">
          <div className="absolute inset-0">
            <CategoryImage
              src={category.imageUrl}
              alt={`${category.eyebrow} services at Glammzo`}
              priority={index === 0}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-l md:from-black/25 md:via-transparent md:to-transparent" />
          <div className="pointer-events-none absolute bottom-5 left-5 right-5 max-w-[280px] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-lg shadow-black/10 backdrop-blur-sm sm:bottom-6 sm:left-auto sm:right-6">
            {category.overlay.badge ? (
              <span className="inline-flex rounded-full bg-[#F5E6A8] px-2.5 py-1 text-[11px] font-semibold text-foreground">
                {category.overlay.badge}
              </span>
            ) : null}
            <p className="mt-2 font-heading text-base font-semibold leading-snug text-foreground">
              {category.overlay.title}
            </p>
            {category.overlay.subtitle ? (
              <p className="mt-1 text-xs text-foreground/55">{category.overlay.subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
