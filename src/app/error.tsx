"use client"

import Link from "next/link"
import { useEffect } from "react"

/**
 * Minimal error UI — no app components or CSS variables so this still loads
 * when the build cache or main bundle is broken.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Glamzzo]", error)
  }, [error])

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "1.5rem",
        fontFamily: "system-ui, sans-serif",
        background: "#f6f4f1",
        color: "#1a1a1a",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "22rem" }}>
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.45,
          }}
        >
          Something went wrong
        </p>
        <h1 style={{ marginTop: "0.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
          We couldn&apos;t load this page
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: 1.6, opacity: 0.65 }}>
          Stop the dev server, run{" "}
          <code style={{ background: "#e8e4df", padding: "0.1rem 0.35rem", borderRadius: "4px" }}>
            npm run dev:clean
          </code>
          , then hard-refresh (Ctrl+Shift+R).
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "9999px",
            border: "none",
            background: "#f95c48",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "9999px",
            border: "1px solid #d4cfc8",
            background: "#fff",
            color: "#1a1a1a",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
