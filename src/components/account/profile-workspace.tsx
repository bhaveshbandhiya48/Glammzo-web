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
import { DeleteAccountButton } from "@/components/auth/delete-account-button"
import { ProfileSettingsForm } from "@/components/auth/profile-settings-form"
import { BookingsSection } from "@/components/booking/bookings-section"
import { Button } from "@/components/ui/button"
import {
  profileMobileNavTitle,
  profileSectionFromHash,
  type ProfileNavSection,
} from "@/lib/account/profile-nav"
import {
  LAUNCH_PROMO_ACTIVE,
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

export type ProfileSectionId = ProfileNavSection

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
    items: [{ id: "details", label: "Profile information", icon: UserRoundIcon }],
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
    case "cashback_glammzo_offer":
      return "Glammzo cashback"
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

function firstName(fullName: string) {
  const part = fullName.trim().split(/\s+/)[0]
  return part || "there"
}

function sectionTitle(id: Exclude<ProfileSectionId, "home">) {
  return profileMobileNavTitle(id)
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

function SectionBody({
  section,
  bookings,
  authenticated,
  bookingsFilter,
  balanceRupees,
  completedVisits,
  freeServiceCredits,
  stampsTowardNextFree,
  ledger,
  profile,
  launchCashback,
  loyaltyCap,
  visitsLeft,
}: {
  section: Exclude<ProfileSectionId, "home">
  bookings: Booking[]
  authenticated: boolean
  bookingsFilter?: string
  balanceRupees: number
  completedVisits: number
  freeServiceCredits: number
  stampsTowardNextFree: number
  ledger: WalletLedgerEntry[]
  profile: ProfileWorkspaceProps["profile"]
  launchCashback: string
  loyaltyCap: string
  visitsLeft: number
}) {
  if (section === "bookings") {
    return (
      <BookingsSection
        bookings={bookings}
        authenticated={authenticated}
        initialFilter={bookingsFilter}
      />
    )
  }

  if (section === "wallet") {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
            Available balance
          </p>
          <p className="mt-2 font-heading text-4xl font-semibold tabular-nums">
            {formatInr(balanceRupees)}
          </p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/60">
            {LAUNCH_PROMO_ACTIVE ? (
              <>
                Use code <span className="font-semibold text-foreground">{LAUNCH_PROMO_CODE}</span>{" "}
                when you book. After your first completed visit, {launchCashback} cashback is added
                to this wallet.
              </>
            ) : (
              <>
                Wallet credit comes from Glammzo cashback offers and reimbursements. Apply an active
                promo at checkout when one is available — cashback lands here after a completed
                visit.
              </>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/explore">Book a salon</Link>
        </Button>
      </div>
    )
  }

  if (section === "loyalty") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-primary/8 px-5 py-5 ring-1 ring-primary/15">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Your reward
          </p>
          <p className="mt-2 font-heading text-lg font-semibold tracking-tight sm:text-xl">
            Complete 10 services and get {loyaltyCap} off any service
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            Or get a free service if that service costs {loyaltyCap} or less. The credit applies on a
            later booking after you hit 10 completed visits.
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
    )
  }

  if (section === "activity") {
    return (
      <div>
        {ledger.length === 0 ? (
          <p className="text-sm text-foreground/55">
            {LAUNCH_PROMO_ACTIVE
              ? `No wallet activity yet. Book with code ${LAUNCH_PROMO_CODE} and get ${launchCashback} cashback after your first completed visit.`
              : "No wallet activity yet. When you claim a Glammzo cashback offer, credits appear here after the visit."}
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
    )
  }

  return (
    <div className="space-y-8">
      <ProfileSettingsForm
        defaultName={profile.name}
        defaultEmail={profile.email}
        defaultPhone={profile.phone}
        defaultGender={profile.gender}
        defaultDateOfBirth={profile.dateOfBirth}
        defaultAddress={profile.address}
      />
      <DeleteAccountButton />
    </div>
  )
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
    const applyHash = () => setSection(profileSectionFromHash(window.location.hash))
    applyHash()
    window.addEventListener("hashchange", applyHash)
    window.addEventListener("popstate", applyHash)
    return () => {
      window.removeEventListener("hashchange", applyHash)
      window.removeEventListener("popstate", applyHash)
    }
  }, [])

  // Soft navigations can land before the hash is applied.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSection(profileSectionFromHash(window.location.hash))
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  // Next soft-navigations to this page can land before the hash is applied.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSection(profileSectionFromHash(window.location.hash))
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  const selectSection = (id: ProfileSectionId) => {
    setSection(id)
    const hash = id === "home" ? "profile" : id
    window.history.replaceState(null, "", `#${hash}`)
    window.dispatchEvent(new Event("hashchange"))
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
        item.id === "wallet" ? { ...item, trailing: formatInr(balanceRupees) } : item,
      ),
    }
  })

  const desktopSection: Exclude<ProfileSectionId, "home"> =
    section === "home" ? "wallet" : section

  const sectionBodyProps = {
    bookings,
    authenticated,
    bookingsFilter,
    balanceRupees,
    completedVisits,
    freeServiceCredits,
    stampsTowardNextFree,
    ledger,
    profile,
    launchCashback,
    loyaltyCap,
    visitsLeft,
  }

  const hubRows: Array<{
    id: Exclude<ProfileSectionId, "home" | "bookings">
    label: string
    hint?: string
    icon: typeof WalletIcon
  }> = [
    { id: "details", label: "Profile", hint: "Name, phone, address", icon: UserRoundIcon },
    { id: "wallet", label: "Wallet", hint: formatInr(balanceRupees), icon: WalletIcon },
    { id: "loyalty", label: "Loyalty rewards", hint: `${stampsTowardNextFree}/10 visits`, icon: GiftIcon },
    { id: "activity", label: "Wallet activity", icon: HistoryIcon },
  ]

  return (
    <>
      {/* —— Mobile app screens —— */}
      <div className="lg:hidden">
        {section === "bookings" ? (
          <div className="-mx-1">
            {/* Title lives in the mobile navbar */}
            <SectionBody section="bookings" {...sectionBodyProps} />
          </div>
        ) : null}

        {section === "home" ? (
          <div className="-mx-1 space-y-5">
            <header className="flex items-center gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground shadow-md shadow-primary/25"
                aria-hidden
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-foreground/50">Hello</p>
                <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
                  {greetingName}
                </h1>
                {profile.phone ? (
                  <p className="mt-0.5 truncate text-sm text-foreground/55">{profile.phone}</p>
                ) : null}
              </div>
            </header>

            <button
              type="button"
              onClick={() => selectSection("wallet")}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-foreground px-5 py-4 text-left text-background shadow-lg shadow-black/15 transition active:scale-[0.99]"
            >
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-background/55 uppercase">
                  Wallet balance
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
                  {formatInr(balanceRupees)}
                </p>
              </div>
              <ChevronRightIcon className="size-5 text-background/50" aria-hidden />
            </button>

            <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border/70">
              {hubRows.map((row, index) => {
                const Icon = row.icon
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => selectSection(row.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-muted/50",
                      index > 0 && "border-t border-border/60",
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-foreground">
                        {row.label}
                      </span>
                      {row.hint ? (
                        <span className="mt-0.5 block truncate text-xs text-foreground/50">
                          {row.hint}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRightIcon className="size-4 text-foreground/30" aria-hidden />
                  </button>
                )
              })}
            </div>

            <LogoutFormButton
              variant="outline"
              pendingLabel="Signing out…"
              className="h-12 w-full justify-center gap-2 rounded-full"
            >
              <LogOutIcon className="size-4" />
              Sign out
            </LogoutFormButton>
          </div>
        ) : null}

        {section !== "home" && section !== "bookings" ? (
          <div className="-mx-1">
            {/* Back + title live in the mobile navbar */}
            <SectionBody section={section} {...sectionBodyProps} />
          </div>
        ) : null}
      </div>

      {/* —— Desktop sidebar layout —— */}
      <div className="hidden lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-5">
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
              const isDirectActive = group.directId != null && desktopSection === group.directId

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
                          const active = desktopSection === item.id
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

        <div className="min-w-0 rounded-xl border border-border/70 bg-white p-8 shadow-sm shadow-black/[0.03]">
          <div className="mb-6 border-b border-border/60 pb-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {sectionTitle(desktopSection)}
            </h2>
          </div>
          <SectionBody section={desktopSection} {...sectionBodyProps} />
        </div>
      </div>
    </>
  )
}
