type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}

/** Safe JSON-LD script tag for App Router pages. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
