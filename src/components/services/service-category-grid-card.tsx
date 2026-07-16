import Link from "next/link"

import type { Category } from "@/types/landing"
import { Button } from "@/components/ui/button"
import { CategoryImage } from "@/components/shared/category-image"

type ServiceCategoryGridCardProps = {
  category: Category
  priority?: boolean
}

export function ServiceCategoryGridCard({ category, priority }: ServiceCategoryGridCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.03] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.08]">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <CategoryImage
          src={category.imageUrl}
          alt={`${category.eyebrow} services at Glammzo`}
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {category.overlay.badge ? (
          <span className="absolute left-4 top-4 inline-flex rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
            {category.overlay.badge}
          </span>
        ) : null}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-heading text-lg font-semibold text-white">{category.overlay.title}</p>
          {category.overlay.subtitle ? (
            <p className="mt-0.5 text-xs text-white/75">{category.overlay.subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="meta-label">{category.eyebrow}</p>
        <h3 className="mt-3 font-heading text-xl font-semibold leading-snug tracking-tight">
          {category.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/65">
          {category.description}
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href={`/explore?category=${category.id}`}>Browse {category.eyebrow}</Link>
        </Button>
      </div>
    </article>
  )
}
