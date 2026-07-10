import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { cn } from "@/lib/utils"

export function SitePageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <Navbar />
      <main className="page-main section-y">
        <Container className={cn(className)}>{children}</Container>
      </main>
      <Footer />
    </>
  )
}
