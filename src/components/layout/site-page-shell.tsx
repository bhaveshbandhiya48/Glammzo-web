import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { cn } from "@/lib/utils"

export function SitePageShell({
  children,
  className,
  mainClassName,
  navbarSalonName,
  navbarBackHref,
  navbarMobileTitle,
  compactMain = false,
}: {
  children: React.ReactNode
  className?: string
  mainClassName?: string
  navbarSalonName?: string
  navbarBackHref?: string
  navbarMobileTitle?: string
  /** Skip landing-page section padding (booking / confirmation flows). */
  compactMain?: boolean
}) {
  return (
    <>
      <Navbar
        salonName={navbarSalonName}
        backHref={navbarBackHref}
        mobileTitle={navbarMobileTitle}
      />
      <main className={cn("page-main", compactMain ? "py-4 pb-28 sm:py-6 lg:py-16" : "section-y", mainClassName)}>
        <Container className={cn(className)}>{children}</Container>
      </main>
      <Footer />
    </>
  )
}
