"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="max-w-md">
        <div className="font-heading text-2xl font-semibold tracking-tight">
          Password reset not available
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground/65">
          Glammzo uses mobile number sign in with one time codes. Please return to sign in.
        </p>
      </div>

      <div className="mt-7 max-w-md">
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  )
}

