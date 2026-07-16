import { redirect } from "next/navigation"

/** Legacy apply flow — replaced by self-serve onboarding. */
export default function PartnerSignupRedirect() {
  redirect("/for-salons/start")
}
