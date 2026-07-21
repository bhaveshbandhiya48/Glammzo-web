import { buildSalonInfoCards } from "@/lib/salons/salon-info-cards"
import { SalonDistanceFromYou } from "@/components/salons/salon-distance"
import type { Salon } from "@/types/salon"

export function SalonDetailInfoGrid({ salon }: { salon: Salon }) {
  const cards = buildSalonInfoCards(salon)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ icon: Icon, title, description }) => (
        <article
          key={title}
          className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm shadow-black/[0.03] transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </div>
          <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/70">{description}</p>
          {title === "Address" ? (
            <SalonDistanceFromYou salon={salon} className="mt-3 text-sm" />
          ) : null}
        </article>
      ))}
    </div>
  )
}
