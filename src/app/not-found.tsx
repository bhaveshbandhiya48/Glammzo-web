import Link from "next/link"

import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="page-main section-y min-h-[calc(100vh-4.25rem)]">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm leading-6 text-foreground/65">
            The page you&apos;re looking for doesn&apos;t exist (or moved).
          </p>
          <div className="mt-6 flex gap-2">
            <Button asChild className="rounded-xl">
              <Link href="/">Back home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
