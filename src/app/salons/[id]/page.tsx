import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ClockIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react"

import { getSalonById } from "@/data/salons"
import { getSession } from "@/lib/auth/session"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { PageSection } from "@/components/layout/page-section"
import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SalonGalleryReviews } from "@/components/salons/salon-gallery-reviews"
import { SalonServicesSection } from "@/components/salons/salon-services-section"
import { Footer } from "@/components/sections/parts/footer"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const salon = getSalonById(id)
  if (!salon) return { title: "Salon not found" }
  return { title: salon.name, description: salon.description }
}

export default async function SalonDetailPage({ params }: Props) {
  const { id } = await params
  const salon = getSalonById(id)
  if (!salon) notFound()

  const session = await getSession()
  const bookHref = session
    ? `/book/${salon.id}`
    : `/login?next=${encodeURIComponent(`/book/${salon.id}`)}`

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PageSection bleed className="!py-0">
          <div className="relative aspect-[21/9] w-full max-h-[420px] overflow-hidden">
            <Image
              src={salon.imageUrl}
              alt={salon.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </div>
          <Container className="relative -mt-16 pb-20 sm:-mt-20 sm:pb-28">
            <Link
              href="/explore"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              Back to explore
            </Link>
            <div className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.03] backdrop-blur-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={salon.isOpenNow ? "default" : "secondary"}
                      className="rounded-full"
                    >
                      {salon.isOpenNow ? "Open now" : "Closed"}
                    </Badge>
                    <span className="section-eyebrow !mb-0 normal-case tracking-[0.14em]">
                      {salon.area}
                    </span>
                  </div>
                  <h1 className="display-section mt-4">{salon.name}</h1>
                  <p className="mt-3 flex items-center gap-2 text-[15px] text-foreground/65 sm:text-base">
                    <MapPinIcon className="size-4 shrink-0 text-primary" />
                    {salon.area} · {salon.distanceKm.toFixed(1)} km away
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 font-heading text-lg font-semibold">
                    <StarIcon className="size-4 fill-primary text-primary" />
                    {salon.rating.toFixed(1)}
                    <span className="text-sm font-normal text-foreground/60">
                      ({salon.reviews.toLocaleString()})
                    </span>
                  </span>
                  <Button asChild className="rounded-full px-8">
                    <Link href={bookHref}>Book appointment</Link>
                  </Button>
                </div>
              </div>
              <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-foreground/70 sm:text-base">
                {salon.description}
              </p>
              <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: MapPinIcon, label: "Address", value: salon.address },
                  { icon: ClockIcon, label: "Hours", value: salon.hours },
                  { icon: PhoneIcon, label: "Phone", value: salon.phone },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex gap-3 rounded-2xl border border-border/60 bg-background/60 p-4"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-foreground/75">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </PageSection>

        <PageSection>
          <SectionHeader
            eyebrow="Book"
            title="Services & pricing"
            subtitle="Add one or more treatments to your visit. Transparent pricing before you confirm."
          />
          <SalonServicesSection
            services={salon.services}
            priceFrom={salon.priceFrom}
            salonId={salon.id}
            authenticated={!!session}
          />
        </PageSection>

        {(salon.gallery.length > 0 ||
          salon.customerReviews.length > 0 ||
          salon.team.length > 0) && (
          <PageSection>
            <SectionHeader
              eyebrow="Inside the salon"
              title="Gallery, team & reviews"
              subtitle="Explore the space, meet our specialists, and read verified feedback from recent visits."
              className="mb-10"
            />
            <SalonGalleryReviews
              gallery={salon.gallery}
              reviews={salon.customerReviews}
              team={salon.team}
              rating={salon.rating}
              reviewCount={salon.reviews}
              salonName={salon.name}
            />
          </PageSection>
        )}
      </main>
      <Footer />
    </>
  )
}
