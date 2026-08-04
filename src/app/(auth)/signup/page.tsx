import { redirect } from "next/navigation"

/**
 * Signup is merged into /login — phone OTP creates the account on first verify.
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next
  const nextPath = typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : null

  redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login")
}
