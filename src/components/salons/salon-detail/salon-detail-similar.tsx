import { SalonCard } from "@/components/salons/salon-card"
import type { Salon } from "@/types/salon"

export function SalonDetailSimilar({ salons, authenticated }: { salons: Salon[]; authenticated: boolean }) {
  if (salons.length === 0) return null

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {salons.map((salon) => (
        <SalonCard
          key={salon.id}
          salon={salon}
          favorite={
            salon.crmSalonId
              ? { authenticated, initialFavorited: false }
              : undefined
          }
        />
      ))}
    </div>
  )
}
