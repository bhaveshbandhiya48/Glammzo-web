import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/sections/parts/footer"
import { cn } from "@/lib/utils"

export function SitePageShell({
  children,
  className,
  mainClassName,
}: {
  children: React.ReactNode
  className?: string
  mainClassName?: string
}) {
  return (
    <>
      <Navbar />
      <main className={cn("page-main section-y", mainClassName)}>
        <Container className={cn(className)}>{children}</Container>
      </main>
      <Footer />
    </>
  )
}
