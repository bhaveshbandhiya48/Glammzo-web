import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AccessibilityIcon,
  ArmchairIcon,
  ArrowLeftIcon,
  BabyIcon,
  ClockIcon,
  CoffeeIcon,
  CreditCardIcon,
  MapPinIcon,
  ParkingCircleIcon,
  PhoneIcon,
  SparklesIcon,
  StarIcon,
  WifiIcon,
} from "lucide-react"

import { getSalonById } from "@/lib/salons"
import { getSession } from "@/lib/auth/session"
import { isSalonFavorited } from "@/lib/favorites/server"
import { trackListingView } from "@/lib/listing/track-listing-view"
import { buildSalonJsonLd } from "@/lib/seo/salon-json-ld"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { PageSection } from "@/components/layout/page-section"
import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SalonBookingCatalogSection } from "@/components/salons/salon-booking-catalog-section"
import { SalonOffersSection } from "@/components/salons/salon-offers-section"
import { SalonDistance } from "@/components/salons/salon-distance"
import { SalonGalleryReviews } from "@/components/salons/salon-gallery-reviews"
import { SalonListingPreviewBanner } from "@/components/salons/salon-listing-preview-banner"
import { FavoriteSalonButton } from "@/components/favorites/favorite-salon-button"
import { Footer } from "@/components/sections/parts/footer"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ preview?: string }>
}

function isPreviewMode(value: string | undefined) {
  return value === "1" || value === "true"
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { preview } = await searchParams
  const salon = await getSalonById(id, { preview: isPreviewMode(preview) })
  if (!salon) return { title: "Salon not found" }
  return {
    title: salon.name,
    description: salon.description,
    robots: isPreviewMode(preview) ? { index: false, follow: false } : undefined,
  }
}

export default async function SalonDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { preview } = await searchParams
  const isPreview = isPreviewMode(preview)
  const salon = await getSalonById(id, { preview: isPreview })
  if (!salon) notFound()

  if (!isPreview && salon.crmSalonId) {
    void trackListingView(salon.crmSalonId)
  }

  const session = await getSession()
  const initialFavorited =
    session?.phone && salon.crmSalonId
      ? await isSalonFavorited(session.phone, salon.crmSalonId)
      : false
  const bookHref = session
    ? `/book/${salon.id}`
    : `/login?next=${encodeURIComponent(`/book/${salon.id}`)}`

  const pageUrl = `https://glammzo.com/salons/${encodeURIComponent(salon.id)}`
  const jsonLd = buildSalonJsonLd(salon, pageUrl)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      {isPreview ? <SalonListingPreviewBanner /> : null}
      <main className="page-main">
        <PageSection bleed className="!py-0">
          <div className="relative aspect-[16/9] w-full max-h-[420px] overflow-hidden">
            <Image
              src={salon.coverImageUrl}
              alt={salon.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </div>
          <Container className="relative -mt-16 pb-20 sm:-mt-20 sm:pb-28">
            <div className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.03] backdrop-blur-sm sm:p-8">
              <Link
                href="/explore"
                className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                <ArrowLeftIcon className="size-4" />
                Back to explore
              </Link>
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
                  <SalonDistance
                    salon={salon}
                    className="mt-3 flex items-center gap-2 text-[15px] text-foreground/65 sm:text-base"
                  />
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  {salon.crmSalonId ? (
                    <FavoriteSalonButton
                      salonId={salon.id}
                      crmSalonId={salon.crmSalonId}
                      initialFavorited={initialFavorited}
                      authenticated={Boolean(session)}
                    />
                  ) : null}
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

        {salon.offers.length > 0 ? (
          <PageSection>
            <SalonOffersSection
              offers={salon.offers}
              salonId={salon.id}
              authenticated={!!session}
            />
          </PageSection>
        ) : null}

        <PageSection>
          <SectionHeader
            eyebrow="Book online"
            title="Packages & services"
            subtitle="Start with a value package or choose individual services."
            className="mb-8"
          />
          <SalonBookingCatalogSection
            services={salon.services}
            packages={salon.packages}
            salonId={salon.id}
            salonName={salon.name}
            salonCoverImageUrl={salon.coverImageUrl}
            authenticated={!!session}
            customerReviews={salon.customerReviews}
            cancellationPolicy={salon.cancellationPolicy}
          />
        </PageSection>

        {salon.amenities?.categories?.length ? (
          <PageSection>
            <SectionHeader
              eyebrow="Amenities"
              title="What this place offers"
            />

            <ul className="mt-6 grid grid-cols-2 gap-x-10 gap-y-6">
              {salon.amenities.categories.map((cat) => (
                  <li key={`${salon.id}-${cat.name}`} className="min-w-0">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex size-9 items-center justify-center text-foreground/80">
                        {cat.icon === "Wifi" ? <WifiIcon className="size-6" /> : null}
                        {cat.icon === "ParkingCircle" ? (
                          <ParkingCircleIcon className="size-6" />
                        ) : null}
                        {cat.icon === "Coffee" ? <CoffeeIcon className="size-6" /> : null}
                        {cat.icon === "CreditCard" ? (
                          <CreditCardIcon className="size-6" />
                        ) : null}
                        {cat.icon === "Armchair" ? <ArmchairIcon className="size-6" /> : null}
                        {cat.icon === "Accessibility" ? (
                          <AccessibilityIcon className="size-6" />
                        ) : null}
                        {cat.icon === "Baby" ? <BabyIcon className="size-6" /> : null}
                        {cat.icon === "Sparkles" ? <SparklesIcon className="size-6" /> : null}
                      </span>
                      <span className="truncate text-sm font-medium text-foreground/80">
                        {cat.name}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </PageSection>
        ) : null}

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
