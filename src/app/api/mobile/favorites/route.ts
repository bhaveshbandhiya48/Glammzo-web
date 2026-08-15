import {
  jsonError,
  jsonOk,
  MobileAuthError,
  requireBearerSession,
} from "@/lib/auth/mobile-bearer"
import { getConsumerFavoriteSalonIds } from "@/lib/favorites/server"
import { normalizeCustomerPhoneDigits } from "@/lib/phone/normalize"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }
    const ids = [...(await getConsumerFavoriteSalonIds(session.phone))]
    return jsonOk({ salonIds: ids })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/favorites GET]", error)
    return jsonError(500, "Could not load favorites.")
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireBearerSession(request)
    if (!session.phone) {
      return jsonError(401, "Sign in required.")
    }
    if (!isSupabaseConfigured()) {
      return jsonError(503, "Favorites are not available right now.")
    }

    const body = (await request.json().catch(() => null)) as {
      salonId?: unknown
    } | null
    const salonId = typeof body?.salonId === "string" ? body.salonId.trim() : ""
    if (!salonId) {
      return jsonError(400, "salonId is required.")
    }

    const phoneDigits = normalizeCustomerPhoneDigits(session.phone)
    if (!phoneDigits) {
      return jsonError(400, "Invalid phone number on your account.")
    }

    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from("consumer_favorite_salons")
      .select("id")
      .eq("consumer_phone_normalized", phoneDigits)
      .eq("salon_id", salonId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("consumer_favorite_salons")
        .delete()
        .eq("id", (existing as { id: string }).id)
      if (error) {
        return jsonError(500, "Could not remove favorite.")
      }
      const salonIds = [...(await getConsumerFavoriteSalonIds(session.phone))]
      return jsonOk({ favorited: false, salonIds })
    }

    const { error } = await supabase.from("consumer_favorite_salons").insert({
      consumer_phone_normalized: phoneDigits,
      salon_id: salonId,
    })
    if (error) {
      return jsonError(500, "Could not save favorite.")
    }

    const salonIds = [...(await getConsumerFavoriteSalonIds(session.phone))]
    return jsonOk({ favorited: true, salonIds })
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return jsonError(error.status, error.message)
    }
    console.error("[mobile/favorites POST]", error)
    return jsonError(500, "Could not update favorite.")
  }
}
