"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 lg:block lg:flex-none">
      <div className="flex-1 pt-4 lg:pt-0">
        <p className="text-sm font-medium tracking-wide text-primary">Mobile sign-in</p>
        <h2 className="mt-2 font-heading text-[1.85rem] font-semibold tracking-tight sm:text-3xl">
          No password needed
        </h2>
        <p className="mt-3 text-sm leading-6 text-foreground/65">
          Glammzo uses your mobile number and a one-time code. Return to continue and we&apos;ll
          text you a fresh code.
        </p>

        <Button asChild size="lg" className="mt-8 hidden h-12 w-full lg:inline-flex">
          <Link href="/login">Continue with mobile</Link>
        </Button>
      </div>

      <div className="sticky bottom-0 z-10 -mx-5 mt-auto border-t border-border/50 bg-background/90 px-5 pt-3 backdrop-blur-md pb-[max(0.85rem,env(safe-area-inset-bottom))] lg:hidden">
        <Button asChild size="lg" className="h-12 w-full">
          <Link href="/login">Continue with mobile</Link>
        </Button>
      </div>
    </div>
  )
}
