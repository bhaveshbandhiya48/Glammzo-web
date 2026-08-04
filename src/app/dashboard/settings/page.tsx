import { redirect } from "next/navigation"

/** Settings moved into Profile (wallet, loyalty, personal details). */
export default function SettingsRedirectPage() {
  redirect("/dashboard/profile#details")
}
