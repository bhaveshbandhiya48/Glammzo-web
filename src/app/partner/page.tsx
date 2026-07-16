import { redirect } from "next/navigation"

/** Legacy partner marketing URL — now the For Salons landing. */
export default function PartnerPageRedirect() {
  redirect("/for-salons")
}
