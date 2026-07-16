"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRightIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { forSalonsCopy } from "@/data/for-salons-copy"
import { buildCrmDashboardUrl, getGlamzzoCrmUrl } from "@/lib/crm/glamzzo-crm-url"
import { Button } from "@/components/ui/button"

function isLocalCrmHost(url: string) {
  try {
    const host = new URL(url).hostname
    return host === "localhost" || host === "127.0.0.1"
  } catch {
    return false
  }
}

export function ForSalonsWelcome({ salonId }: { salonId?: string }) {
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null)
  const [autoRedirecting, setAutoRedirecting] = useState(false)
  const { welcome } = forSalonsCopy
  const crmOrigin = getGlamzzoCrmUrl()
  const localDev = isLocalCrmHost(crmOrigin)

  useEffect(() => {
    const stored = sessionStorage.getItem("glamzzo_crm_handoff")
    if (stored) setHandoffUrl(stored)
  }, [])

  useEffect(() => {
    if (!handoffUrl || localDev) return
    setAutoRedirecting(true)
    const timer = window.setTimeout(() => {
      window.location.assign(handoffUrl)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [handoffUrl, localDev])

  const primaryHref = handoffUrl || buildCrmDashboardUrl()

  return (
    <div className="mx-auto w-full max-w-lg text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2Icon className="size-7" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight">{welcome.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground/65 sm:text-base">
        Your CRM dashboard is ready. Complete your business profile, services, and staff there —
        then publish when you want to go live on Glammzo.
      </p>

      {localDev ? (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-left text-sm text-foreground/75">
          <p className="font-medium text-foreground">Start Glammzo CRM first</p>
          <p className="mt-1.5 leading-relaxed">
            Run <code className="rounded bg-background/80 px-1.5 py-0.5 text-xs">npm run dev</code> in{" "}
            <code className="rounded bg-background/80 px-1.5 py-0.5 text-xs">glamzzo-crm</code> (
            {crmOrigin}), then open your dashboard.
          </p>
        </div>
      ) : null}

      <ul className="mt-8 space-y-2 rounded-3xl border border-border/70 bg-card p-5 text-left">
        {welcome.nextSteps.map((step) => (
          <li key={step} className="flex items-start gap-2 text-sm text-foreground/75">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
            {step}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="px-8">
          <a href={primaryHref}>
            {autoRedirecting ? <Loader2Icon className="size-4 animate-spin" /> : null}
            Go to Dashboard
            <ArrowRightIcon className="size-4" />
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="px-8">
          <a href={primaryHref}>Complete Profile</a>
        </Button>
      </div>

      {salonId ? (
        <p className="mt-6 text-xs text-foreground/40">Workspace ID · {salonId}</p>
      ) : null}

      <p className="mt-8 text-sm text-foreground/55">
        <Link href="/for-salons" className="underline underline-offset-4 hover:text-foreground">
          Back to For Salons
        </Link>
      </p>
    </div>
  )
}
