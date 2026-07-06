import { Navbar } from "@/components/layout/navbar"
import { MarqueeBand } from "@/components/shared/marquee-band"
import { MotionProvider } from "@/components/shared/motion"
import { CategoriesSection } from "@/components/sections/parts/categories-section"
import { FeaturedExperienceSection } from "@/components/sections/parts/featured-experience-section"
import { Footer } from "@/components/sections/parts/footer"
import { HeroSection } from "@/components/sections/parts/hero-section"
import { HowItWorksSection } from "@/components/sections/parts/how-it-works-section"
import { MobileAppCtaSection } from "@/components/sections/parts/mobile-app-cta-section"
import { NearbySalonsSection } from "@/components/sections/parts/nearby-salons-section"
import { PartnerSection } from "@/components/sections/parts/partner-section"
import { StatementSection } from "@/components/sections/parts/statement-section"
import { StatsSection } from "@/components/sections/parts/stats-section"
import { TestimonialsSection } from "@/components/sections/parts/testimonials-section"

export function LandingPage() {
  return (
    <MotionProvider>
      <Navbar />
      <main className="page-main">
        <HeroSection />
        <MarqueeBand />
        <HowItWorksSection />
        <CategoriesSection />
        <NearbySalonsSection />
        <StatementSection />
        <StatsSection />
        <FeaturedExperienceSection />
        <TestimonialsSection />
        <PartnerSection />
        <MobileAppCtaSection />
      </main>
      <Footer />
    </MotionProvider>
  )
}
