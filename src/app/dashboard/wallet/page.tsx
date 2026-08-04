import { redirect } from "next/navigation"

/** Wallet moved into Profile. */
export default function WalletRedirectPage() {
  redirect("/dashboard/profile#wallet")
}
