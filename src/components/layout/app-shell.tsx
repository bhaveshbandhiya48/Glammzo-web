import Link from "next/link"

import { LogoutFormButton } from "@/components/auth/logout-form-button"
import { resolveSessionGreeting } from "@/lib/auth/display"
import { getSession } from "@/lib/auth/session"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { Logo } from "@/components/layout/logo"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="rounded-full text-sm">
              <Link href="/explore">Explore</Link>
            </Button>
            <LogoutFormButton variant="outline" size="sm" className="rounded-full" pendingLabel="Logging out…">
              Log out
            </LogoutFormButton>
          </div>
        </Container>
      </header>

      <Container className="section-y grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          {session ? (
            <p className="text-sm text-foreground/60">
              Hi,{" "}
              <span className="font-medium text-foreground">
                {resolveSessionGreeting({ name: session.name, phone: session.phone })}
              </span>
            </p>
          ) : null}
          <DashboardNav />
        </aside>
        <div>{children}</div>
      </Container>
    </div>
  )
}
