"use client"

import { useState, useTransition, type FormEvent } from "react"

import type { AuthState } from "@/lib/auth/auth-types"
import { INITIAL_AUTH_STATE, isFailedAuthState } from "@/lib/auth/auth-types"

type PhoneOtpActions = {
  requestOtp: (prev: AuthState, formData: FormData) => Promise<AuthState>
  verifyOtp: (prev: AuthState, formData: FormData) => Promise<AuthState>
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  )
}

export function usePhoneOtpAuth(actions: PhoneOtpActions) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [requestState, setRequestState] = useState<AuthState>(INITIAL_AUTH_STATE)
  const [verifyState, setVerifyState] = useState<AuthState>(INITIAL_AUTH_STATE)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    startTransition(() => {
      void (async () => {
        try {
          if (step === "phone") {
            const result = await actions.requestOtp(requestState, formData)
            setRequestState(result)
            if (isFailedAuthState(result) && result.step === "otp") {
              setStep("otp")
            }
            return
          }

          const result = await actions.verifyOtp(verifyState, formData)
          setVerifyState(result)
        } catch (error) {
          if (isNextRedirect(error)) {
            throw error
          }

          const fallbackMessage = "Something went wrong. Please try again."
          const message = error instanceof Error ? error.message || fallbackMessage : fallbackMessage

          if (step === "phone") {
            setRequestState({ ok: false, message, step: "phone" })
          } else {
            setVerifyState({ ok: false, message, step: "otp" })
          }
        }
      })()
    })
  }

  function resetToPhone() {
    setStep("phone")
    setRequestState(INITIAL_AUTH_STATE)
    setVerifyState(INITIAL_AUTH_STATE)
  }

  const activeState = step === "otp" ? verifyState : requestState
  const otpSentMessage =
    step === "otp" && isFailedAuthState(requestState) && requestState.step === "otp"
      ? requestState.message
      : ""

  return {
    step,
    activeState,
    requestState,
    verifyState,
    isPending,
    handleSubmit,
    resetToPhone,
    otpSentMessage,
  }
}
