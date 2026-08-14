import { ImageResponse } from "next/og"

export const alt = "Glammzo — find a salon near you and book online"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Default Open Graph / WhatsApp / social share image for Glammzo.
 * App Router serves this at `/opengraph-image`.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #1a1210 0%, #2c1814 48%, #3d1f18 100%)",
          color: "#fffaf7",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#f95c48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Glammzo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
            }}
          >
            Find a salon near you. Book online in minutes.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,250,247,0.72)",
              lineHeight: 1.35,
              maxWidth: 780,
            }}
          >
            Compare fixed prices, ratings, and open slots — hair, spa, nails and more.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 22px",
              borderRadius: 999,
              background: "#f95c48",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Book on glammzo.com
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,250,247,0.55)",
            }}
          >
            Starting in Bengaluru
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
