"use client"

import { testimonials } from "@/data/landing"
import { siteCopy } from "@/data/site-copy"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/shared/section-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MotionDiv, MotionSection, fadeUp, stagger } from "@/components/shared/motion"

const { testimonials: copy } = siteCopy

export function TestimonialsSection() {
  const [featured, ...rest] = testimonials

  return (
    <MotionSection
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="section-y section-y-separated"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <SectionHeader
            eyebrow={copy.eyebrow}
            title={copy.title}
            subtitle={copy.subtitle}
          />
        </MotionDiv>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <MotionDiv variants={fadeUp}>
            <figure className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12">
              <blockquote className="font-heading text-2xl font-medium leading-snug tracking-tight text-foreground/90 sm:text-[1.65rem]">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-border/60 pt-8">
                <Avatar className="size-12">
                  <AvatarImage src={featured.avatarUrl} alt={featured.name} />
                  <AvatarFallback>
                    {featured.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-heading font-semibold">{featured.name}</div>
                  <div className="text-sm text-foreground/55">{featured.role}</div>
                </div>
              </figcaption>
            </figure>
          </MotionDiv>

          <div className="grid gap-4">
            {rest.map((t) => (
              <MotionDiv key={t.id} variants={fadeUp}>
                <figure className="rounded-2xl border border-border/80 bg-card/60 p-6">
                  <blockquote className="text-[15px] leading-7 text-foreground/70">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={t.avatarUrl} alt={t.name} />
                      <AvatarFallback className="text-xs">
                        {t.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-foreground/50">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </MotionDiv>
            ))}
          </div>
        </div>
      </Container>
    </MotionSection>
  )
}
