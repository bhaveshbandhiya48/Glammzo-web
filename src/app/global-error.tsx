"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#f6f4f1",
          color: "#000",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ fontSize: "0.875rem", opacity: 0.65, maxWidth: "24rem" }}>
          Run <code>npm run dev:clean</code> and reload. If this persists, check the terminal for errors.
        </p>
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
      </body>
    </html>
  )
}
