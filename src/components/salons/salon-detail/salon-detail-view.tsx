"use client"

import { useEffect } from "react"
import type { Salon } from "@/types/salon"

import { SalonDetailBookingRail } from "@/components/salons/salon-detail/salon-detail-booking-rail"
import { SalonDetailHero } from "@/components/salons/salon-detail/salon-detail-hero"
import { SalonDetailSection } from "@/components/salons/salon-detail/salon-detail-section"
import { SalonGalleryMasonry } from "@/components/salons/salon-gallery-masonry"
import { SalonBookingCatalogSection } from "@/components/salons/salon-booking-catalog-section"
import { SalonOffersSection } from "@/components/salons/salon-offers-section"
import { SalonDetailInfoGrid } from "@/components/salons/salon-detail/salon-detail-info-grid"
import { SalonDetailAbout } from "@/components/salons/salon-detail/salon-detail-about"
import { SalonDetailAmenities } from "@/components/salons/salon-detail/salon-detail-amenities"
import { SalonDetailReviews } from "@/components/salons/salon-detail/salon-detail-reviews"
import { SalonDetailSimilar } from "@/components/salons/salon-detail/salon-detail-similar"
import { SalonTeamPanel } from "@/components/salons/salon-team-panel"
import { Container } from "@/components/layout/container"
import {
  SALON_SERVICES_SECTION_ID,
  scrollToSalonServicesSection,
} from "@/lib/salons/salon-detail-scroll"

type SalonDetailViewProps = {
  salon: Salon
  similarSalons: Salon[]
  initialFavorited: boolean
  authenticated: boolean
}

export function SalonDetailView({
  salon,
  similarSalons,
  initialFavorited,
  authenticated,
}: SalonDetailViewProps) {
  const galleryImages =
    salon.gallery.length > 0 ? salon.gallery : salon.coverImageUrl ? [salon.coverImageUrl] : []

  useEffect(() => {
    const run = () => {
      if (window.location.hash.replace("#", "") !== SALON_SERVICES_SECTION_ID) return
      window.setTimeout(() => {
        scrollToSalonServicesSection()
      }, 0)
    }

    run()
    window.addEventListener("hashchange", run)
    return () => window.removeEventListener("hashchange", run)
  }, [salon.id])

  return (
    <>
      <SalonDetailHero
        salon={salon}
        initialFavorited={initialFavorited}
        authenticated={authenticated}
      />

      <SalonDetailBookingRail
        salon={salon}
        salonName={salon.name}
        priceFrom={salon.priceFrom}
      />

      <Container className="pb-20 md:pb-16">
        <SalonDetailSection
          id="services"
          eyebrow="Book online"
          title="Services"
          subtitle="Search, filter by category, and add treatments to your visit."
          className="!pt-6 sm:!pt-8"
        >
          <SalonBookingCatalogSection
            services={salon.services}
            packages={salon.packages}
            salonId={salon.id}
            salonName={salon.name}
            salonCoverImageUrl={salon.coverImageUrl}
            authenticated={authenticated}
            customerReviews={salon.customerReviews}
            cancellationPolicy={salon.cancellationPolicy}
          />
        </SalonDetailSection>

        {galleryImages.length > 0 ? (
          <SalonDetailSection
            id="gallery"
            eyebrow="Gallery"
            title="Inside the salon"
            subtitle="Real photos from the team—tap any image to browse full screen."
          >
            <SalonGalleryMasonry gallery={galleryImages} salonName={salon.name} />
          </SalonDetailSection>
        ) : null}

        {salon.offers.length > 0 ? (
          <SalonDetailSection
            id="offers"
            eyebrow="Limited time"
            title="Offers"
            subtitle="Apply a promo when you book online."
          >
            <SalonOffersSection
              offers={salon.offers}
              salonId={salon.id}
              authenticated={authenticated}
              embedded
            />
          </SalonDetailSection>
        ) : null}

        <SalonDetailSection id="about" eyebrow="About" title={`About ${salon.name}`}>
          <SalonDetailAbout salon={salon} />
        </SalonDetailSection>

        <SalonDetailSection
          id="visit"
          eyebrow="Plan your visit"
          title="Business details"
          subtitle="Hours, contact, and practical information in one place."
        >
          <SalonDetailInfoGrid salon={salon} />
        </SalonDetailSection>

        {salon.amenities?.categories?.length ? (
          <SalonDetailSection
            id="amenities"
            title="What this place offers"
            subtitle="Everything guests can expect during their visit."
          >
            <SalonDetailAmenities categories={salon.amenities.categories} />
          </SalonDetailSection>
        ) : null}

        {salon.team.length > 0 ? (
          <SalonDetailSection id="team" eyebrow="Team" title="Meet the specialists">
            <SalonTeamPanel
              team={salon.team}
              salonName={salon.name}
              reviews={salon.customerReviews}
            />
          </SalonDetailSection>
        ) : null}

        <SalonDetailSection
          id="reviews"
          eyebrow="Social proof"
          title="Reviews"
          subtitle="Ratings from verified visits on Glammzo."
        >
          <SalonDetailReviews
            reviews={salon.customerReviews}
            rating={salon.rating}
            reviewCount={salon.reviews}
            salonName={salon.name}
          />
        </SalonDetailSection>

        {similarSalons.length > 0 ? (
          <SalonDetailSection
            id="similar"
            eyebrow="Explore more"
            title="Similar businesses"
            subtitle="Other salons you may like nearby."
          >
            <SalonDetailSimilar salons={similarSalons} authenticated={authenticated} />
          </SalonDetailSection>
        ) : null}
      </Container>
    </>
  )
}
