import { Navbar } from "@/components/layout/navbar"
import { MarqueeBand } from "@/components/shared/marquee-band"
import { MotionProvider } from "@/components/shared/motion"
import { NearbySalonsMarqueeSection } from "@/components/sections/parts/nearby-salons-marquee-section"
import { CategoriesSection } from "@/components/sections/parts/categories-section"
import { FeaturedExperienceSection } from "@/components/sections/parts/featured-experience-section"
import { Footer } from "@/components/sections/parts/footer"
import { HeroSection } from "@/components/sections/parts/hero-section"
import { HowItWorksSection } from "@/components/sections/parts/how-it-works-section"
import { MobileAppCtaSection } from "@/components/sections/parts/mobile-app-cta-section"
import { NearbySalonsSection } from "@/components/sections/parts/nearby-salons-section"
import { PartnerSection } from "@/components/sections/parts/partner-section"
import { StatementSection } from "@/components/sections/parts/statement-section"
import { TestimonialsSection } from "@/components/sections/parts/testimonials-section"
import { WhyChooseSection } from "@/components/sections/parts/why-choose-section"
import { LaunchOfferCtaSection } from "@/components/sections/parts/launch-offer-cta-section"
import { MarketingOfferStrip } from "@/components/marketing/marketing-offer-strip"
import { getBrowseCityFromCookies } from "@/lib/categories/browse-city"
import { getBrowseDefaultCategories } from "@/lib/categories/default-service-categories"
import { getSalons } from "@/lib/salons"

export async function LandingPage() {
  const city = await getBrowseCityFromCookies()
  const [categories, salons] = await Promise.all([
    getBrowseDefaultCategories(city),
    getSalons(),
  ])

  return (
    <MotionProvider>
      <Navbar />
      <main className="page-main">
        <MarketingOfferStrip />
        <HeroSection />
        <MarqueeBand />
        <NearbySalonsMarqueeSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <LaunchOfferCtaSection />
        <CategoriesSection categories={categories} city={city} />
        <NearbySalonsSection />
        <StatementSection
          salonCount={salons.length}
          categoryCount={categories.length}
        />
        <FeaturedExperienceSection />
        <TestimonialsSection />
        <PartnerSection />
        <MobileAppCtaSection />
      </main>
      <Footer />
    </MotionProvider>
  )
}
