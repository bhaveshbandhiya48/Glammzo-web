export type AuthState =
  | { ok: true }
  | {
      ok: false
      message: string
      step?: "phone" | "otp"
      fieldErrors?: Partial<Record<string, string>>
      /** Shown when mock/debug OTP is enabled on the server. */
      debugOtp?: string
    }

export const INITIAL_AUTH_STATE: AuthState = { ok: false, message: "" }

export function isFailedAuthState(
  state: AuthState,
): state is Extract<AuthState, { ok: false }> {
  return !state.ok
}
