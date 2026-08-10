import { GEO_KEY_FACTS } from "@/lib/seo/geo-copy"

type GeoAnswerBlockProps = {
  heading: string
  answer: string
  /** When false, hide the key-facts strip (e.g. area pages). */
  showKeyFacts?: boolean
}

/** Quotable answer block for generative-engine / AI citation surfaces. */
export function GeoAnswerBlock({
  heading,
  answer,
  showKeyFacts = true,
}: GeoAnswerBlockProps) {
  return (
    <section className="section-y section-y-separated" aria-labelledby="geo-answer-heading">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <h2
          id="geo-answer-heading"
          className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {heading}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/75">{answer}</p>

        {showKeyFacts ? (
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {GEO_KEY_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-semibold tracking-[0.12em] text-foreground/45 uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-foreground/80">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}
