"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  GiftIcon,
  HistoryIcon,
  LogOutIcon,
  UserRoundIcon,
  WalletIcon,
} from "lucide-react"

import { LogoutFormButton } from "@/components/auth/logout-form-button"
import { ProfileSettingsForm } from "@/components/auth/profile-settings-form"
import { BookingsSection } from "@/components/booking/bookings-section"
import { Button } from "@/components/ui/button"
import {
  LAUNCH_PROMO_CODE,
  LAUNCH_CASHBACK_RUPEES,
} from "@/lib/marketing/launch-promo"
import { formatInr } from "@/lib/salons/catalog-utils"
import { cn } from "@/lib/utils"
import { LOYALTY_DISCOUNT_CAP_PAISE } from "@/lib/wallet/wallet-constants"
import type { Booking } from "@/types/booking"

type WalletLedgerEntry = {
  id: string
  deltaPaise: number
  reason: string
  createdAt: string
  appointmentId: string | null
}

export type ProfileSectionId = "bookings" | "wallet" | "loyalty" | "activity" | "details"

type NavItem = {
  id: ProfileSectionId
  label: string
  icon: typeof WalletIcon
  trailing?: string
}

type NavGroup = {
  id: string
  title: string
  icon: typeof WalletIcon
  items: NavItem[]
  /** Single top-level row that jumps straight to a section (like Flipkart “MY ORDERS”). */
  directId?: ProfileSectionId
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "bookings",
    title: "My bookings",
    icon: CalendarDaysIcon,
    directId: "bookings",
    items: [],
  },
  {
    id: "account",
    title: "Account settings",
    icon: UserRoundIcon,
    items: [
      { id: "details", label: "Profile information", icon: UserRoundIcon },
    ],
  },
  {
    id: "rewards",
    title: "Payments & rewards",
    icon: WalletIcon,
    items: [
      { id: "wallet", label: "Wallet", icon: WalletIcon },
      { id: "loyalty", label: "Loyalty rewards", icon: GiftIcon },
      { id: "activity", label: "Wallet activity", icon: HistoryIcon },
    ],
  },
]

function reasonLabel(reason: string) {
  switch (reason) {
    case "cashback_first200":
      return "Welcome cashback"
    case "wallet_redeem":
      return "Used on booking"
    case "wallet_restore":
      return "Refunded to wallet"
    case "adjustment":
      return "Adjustment"
    default:
      return reason.replaceAll("_", " ")
  }
}

function sectionFromHash(hash: string): ProfileSectionId {
  const value = hash.replace(/^#/, "")
  if (
    value === "bookings" ||
    value === "loyalty" ||
    value === "activity" ||
    value === "details" ||
    value === "wallet"
  ) {
    return value
  }
  return "bookings"
}

function firstName(fullName: string) {
  const part = fullName.trim().split(/\s+/)[0]
  return part || "there"
}

function sectionTitle(id: ProfileSectionId) {
  switch (id) {
    case "bookings":
      return "My bookings"
    case "wallet":
      return "Wallet"
    case "loyalty":
      return "Loyalty rewards"
    case "activity":
      return "Wallet activity"
    case "details":
      return "Profile information"
  }
}

type ProfileWorkspaceProps = {
  bookings: Booking[]
  authenticated: boolean
  bookingsFilter?: string
  balanceRupees: number
  completedVisits: number
  freeServiceCredits: number
  stampsTowardNextFree: number
  ledger: WalletLedgerEntry[]
  profile: {
    name: string
    email: string
    phone: string
    gender: string
    dateOfBirth: string
    address: string
  }
}

export function ProfileWorkspace({
  bookings,
  authenticated,
  bookingsFilter,
  balanceRupees,
  completedVisits,
  freeServiceCredits,
  stampsTowardNextFree,
  ledger,
  profile,
}: ProfileWorkspaceProps) {
  const [section, setSection] = useState<ProfileSectionId>("bookings")

  useEffect(() => {
    const applyHash = () => setSection(sectionFromHash(window.location.hash))
    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [])

  const selectSection = (id: ProfileSectionId) => {
    setSection(id)
    window.history.replaceState(null, "", `#${id}`)
  }

  const visitsLeft = Math.max(0, 10 - stampsTowardNextFree)
  const loyaltyCap = formatInr(LOYALTY_DISCOUNT_CAP_PAISE / 100)
  const launchCashback = formatInr(LAUNCH_CASHBACK_RUPEES)
  const greetingName = firstName(profile.name)
  const initials = greetingName.slice(0, 1).toUpperCase()

  const navGroups: NavGroup[] = NAV_GROUPS.map((group) => {
    if (group.id !== "rewards") return group
    return {
      ...group,
      items: group.items.map((item) =>
        item.id === "wallet"
          ? { ...item, trailing: formatInr(balanceRupees) }
          : item,
      ),
    }
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-5">
      {/* Sidebar */}
      <aside className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-white px-4 py-3.5 shadow-sm shadow-black/[0.03]">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-foreground/50">Hello,</p>
            <p className="truncate font-heading text-lg font-semibold tracking-tight">
              {greetingName}
            </p>
          </div>
        </div>

        <nav
          aria-label="Account menu"
          className="overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm shadow-black/[0.03]"
        >
          {navGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon
            const isDirectActive = group.directId != null && section === group.directId

            return (
              <div
                key={group.id}
                className={cn(groupIndex > 0 && "border-t border-border/60")}
              >
                {group.directId ? (
                  <button
                    type="button"
                    onClick={() => selectSection(group.directId!)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                      isDirectActive ? "bg-primary/8" : "hover:bg-muted/40",
                    )}
                  >
                    <GroupIcon
                      className={cn(
                        "size-5 shrink-0",
                        isDirectActive ? "text-primary" : "text-primary/80",
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm font-semibold tracking-wide uppercase",
                        isDirectActive ? "text-primary" : "text-foreground/80",
                      )}
                    >
                      {group.title}
                    </span>
                    <ChevronRightIcon
                      className="size-4 text-foreground/35"
                      aria-hidden
                    />
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-3 px-4 pt-3.5 pb-1.5">
                      <GroupIcon className="size-5 shrink-0 text-primary" aria-hidden />
                      <p className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">
                        {group.title}
                      </p>
                    </div>
                    <ul className="pb-2">
                      {group.items.map((item) => {
                        const active = section === item.id
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => selectSection(item.id)}
                              className={cn(
                                "flex w-full items-center gap-2 border-l-[3px] py-2.5 pr-4 pl-12 text-left text-sm transition-colors",
                                active
                                  ? "border-primary bg-primary/8 font-medium text-primary"
                                  : "border-transparent text-foreground/70 hover:bg-muted/35 hover:text-foreground",
                              )}
                            >
                              <span className="flex-1">{item.label}</span>
                              {item.trailing ? (
                                <span className="tabular-nums text-xs font-medium text-foreground/45">
                                  {item.trailing}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </div>
            )
          })}

          <div className="border-t border-border/60 px-3 py-3">
            <LogoutFormButton
              variant="ghost"
              pendingLabel="Signing out…"
              className="h-10 w-full justify-start gap-3 px-1 text-foreground/70 hover:bg-muted/40 hover:text-foreground"
            >
              <LogOutIcon className="size-5 text-primary" />
              <span className="text-sm font-semibold tracking-wide uppercase">Sign out</span>
            </LogoutFormButton>
          </div>
        </nav>
      </aside>

      {/* Content panel */}
      <div className="min-w-0 rounded-xl border border-border/70 bg-white p-5 shadow-sm shadow-black/[0.03] sm:p-7 lg:p-8">
        <div className="mb-6 border-b border-border/60 pb-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            {sectionTitle(section)}
          </h2>
        </div>

        {section === "bookings" ? (
          <BookingsSection
            bookings={bookings}
            authenticated={authenticated}
            initialFilter={bookingsFilter}
          />
        ) : null}

        {section === "wallet" ? (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Available balance
              </p>
              <p className="mt-2 font-heading text-4xl font-semibold tabular-nums">
                {formatInr(balanceRupees)}
              </p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/60">
                Use code <span className="font-semibold text-foreground">{LAUNCH_PROMO_CODE}</span> when
                you book. After your first completed visit, {launchCashback} cashback is added to this
                wallet.
              </p>
            </div>
            <Button asChild>
              <Link href="/explore">Book a salon</Link>
            </Button>
          </div>
        ) : null}

        {section === "loyalty" ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/6 px-5 py-5">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                Your reward
              </p>
              <p className="mt-2 font-heading text-lg font-semibold tracking-tight sm:text-xl">
                Complete 10 services and get {loyaltyCap} off any service
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Or get a free service if that service costs {loyaltyCap} or less. The credit applies
                on a later booking after you hit 10 completed visits.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                Progress
              </p>
              <p className="mt-2 font-heading text-4xl font-semibold tabular-nums">
                {stampsTowardNextFree}
                <span className="text-xl text-foreground/35">/10</span>
              </p>
              <p className="mt-2 text-sm text-foreground/60">
                {completedVisits} completed visit{completedVisits === 1 ? "" : "s"}
                {visitsLeft > 0
                  ? ` · ${visitsLeft} more to unlock ${loyaltyCap} off`
                  : ` · ready for your next ${loyaltyCap} reward cycle`}
              </p>
              <div className="mt-5 flex gap-1.5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index < stampsTowardNextFree
                        ? "h-2.5 flex-1 rounded-full bg-primary"
                        : "h-2.5 flex-1 rounded-full bg-border"
                    }
                  />
                ))}
              </div>
              <p className="mt-5 text-sm font-medium text-foreground/80">
                Loyalty credits ready: {freeServiceCredits}
              </p>
            </div>
          </div>
        ) : null}

        {section === "activity" ? (
          <div>
            {ledger.length === 0 ? (
              <p className="text-sm text-foreground/55">
                No wallet activity yet. Book with code {LAUNCH_PROMO_CODE} and get {launchCashback}{" "}
                cashback after your first completed visit.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {ledger.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 py-3.5 text-sm first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{reasonLabel(entry.reason)}</p>
                      <p className="text-xs text-foreground/45">
                        {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <p
                      className={
                        entry.deltaPaise > 0
                          ? "font-semibold tabular-nums text-emerald-700"
                          : "font-semibold tabular-nums text-foreground"
                      }
                    >
                      {entry.deltaPaise > 0 ? "+" : ""}
                      {formatInr(entry.deltaPaise / 100)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {section === "details" ? (
          <ProfileSettingsForm
            defaultName={profile.name}
            defaultEmail={profile.email}
            defaultPhone={profile.phone}
            defaultGender={profile.gender}
            defaultDateOfBirth={profile.dateOfBirth}
            defaultAddress={profile.address}
          />
        ) : null}
      </div>
    </div>
  )
}
