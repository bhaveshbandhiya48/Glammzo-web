import Link from "next/link"

import { SalonCard } from "@/components/salons/salon-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { getConsumerFavoriteSalons } from "@/lib/favorites/server"
import { getSession } from "@/lib/auth/session"

export default async function FavoritesPage() {
  const session = await getSession()
  const favorites = session?.phone ? await getConsumerFavoriteSalons(session.phone) : []

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="Saved salons"
        subtitle="Salons you’ve favorited for quick access and rebooking."
      />

      {favorites.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="px-6 py-10 text-center">
            <p className="text-foreground/65">You haven&apos;t saved any salons yet.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/explore">Explore salons</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((salon) => (
            <li key={salon.id}>
              <SalonCard
                salon={salon}
                favorite={{
                  authenticated: true,
                  initialFavorited: true,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
