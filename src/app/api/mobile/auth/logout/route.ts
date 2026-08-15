import { jsonOk } from "@/lib/auth/mobile-bearer"

/** Stateless JWT — client clears SecureStore. */
export async function POST() {
  return jsonOk({ message: "Signed out." })
}
