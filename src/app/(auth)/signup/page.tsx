import { SignupForm } from "@/components/auth/signup-form"

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next
  const nextPath = typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : "/"

  return <SignupForm nextPath={nextPath} />
}
