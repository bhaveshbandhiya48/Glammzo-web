import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : sp.next
  const nextPath = typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : "/dashboard"
  return <LoginForm nextPath={nextPath} />
}

