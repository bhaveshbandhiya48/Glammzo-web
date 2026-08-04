"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react"

import type { AuthState } from "@/lib/auth/auth-types"
import {
  INITIAL_AUTH_STATE,
  isFailedAuthState,
  isSuccessfulAuthState,
} from "@/lib/auth/auth-types"

type PhoneOtpActions = {
  requestOtp: (prev: AuthState, formData: FormData) => Promise<AuthState>
  verifyOtp: (prev: AuthState, formData: FormData) => Promise<AuthState>
}

export function usePhoneOtpAuth(actions: PhoneOtpActions) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [requestState, setRequestState] = useState<AuthState>(INITIAL_AUTH_STATE)
  const [verifyState, setVerifyState] = useState<AuthState>(INITIAL_AUTH_STATE)
  const [isPending, startTransition] = useTransition()
  const [resendSeconds, setResendSeconds] = useState(0)
  const resendTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resendTimerRef.current != null) {
        window.clearInterval(resendTimerRef.current)
      }
    }
  }, [])

  const startResendCooldown = useCallback(() => {
    if (resendTimerRef.current != null) {
      window.clearInterval(resendTimerRef.current)
    }

    setResendSeconds(30)
    const startedAt = Date.now()
    resendTimerRef.current = window.setInterval(() => {
      const remaining = Math.max(0, 30 - Math.floor((Date.now() - startedAt) / 1000))
      setResendSeconds(remaining)
      if (remaining <= 0 && resendTimerRef.current != null) {
        window.clearInterval(resendTimerRef.current)
        resendTimerRef.current = null
      }
    }, 250)
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    startTransition(() => {
      void (async () => {
        try {
          if (step === "phone") {
            const phoneValue = String(formData.get("phone") ?? "").trim()
            const result = await actions.requestOtp(requestState, formData)
            setRequestState(result)
            if (isFailedAuthState(result) && result.step === "otp") {
              setPhone(phoneValue)
              setStep("otp")
              setVerifyState(INITIAL_AUTH_STATE)
              startResendCooldown()
            }
            return
          }

          const result = await actions.verifyOtp(verifyState, formData)

          if (isSuccessfulAuthState(result)) {
            window.location.assign(result.redirectTo)
            return
          }

          setVerifyState(result)
          if (isFailedAuthState(result) && result.step === "phone") {
            setStep("phone")
            setRequestState(result)
          }
        } catch (error) {
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

  function resendCode(nextPath: string) {
    if (!phone || resendSeconds > 0 || isPending) return

    const formData = new FormData()
    formData.set("phone", phone)
    formData.set("next", nextPath)

    startTransition(() => {
      void (async () => {
        try {
          const result = await actions.requestOtp(requestState, formData)
          setRequestState(result)
          if (isFailedAuthState(result) && result.step === "otp") {
            setVerifyState(INITIAL_AUTH_STATE)
            startResendCooldown()
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "We couldn't resend the code. Try again."
          setRequestState({ ok: false, message, step: "otp" })
        }
      })()
    })
  }

  function resetToPhone() {
    if (resendTimerRef.current != null) {
      window.clearInterval(resendTimerRef.current)
      resendTimerRef.current = null
    }
    setStep("phone")
    setRequestState(INITIAL_AUTH_STATE)
    setVerifyState(INITIAL_AUTH_STATE)
    setResendSeconds(0)
  }

  const activeState = step === "otp" ? verifyState : requestState
  const otpSentMessage =
    step === "otp" && isFailedAuthState(requestState) && requestState.step === "otp"
      ? requestState.message
      : ""

  return {
    step,
    phone,
    activeState,
    requestState,
    verifyState,
    isPending,
    resendSeconds,
    handleSubmit,
    resetToPhone,
    resendCode,
    otpSentMessage,
  }
}
