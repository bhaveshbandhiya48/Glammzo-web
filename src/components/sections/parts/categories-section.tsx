"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { siteCopy } from "@/data/site-copy"
import type { Category } from "@/types/landing"
import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/shared/section-header"
import { CategoryStackCard } from "@/components/services/category-stack-card"
import { Button } from "@/components/ui/button"
import { MotionDiv, MotionSection, fadeUpSubtle } from "@/components/shared/motion"

/** Sticky offset under navbar, small step = subtle stack overlap */
const STACK_TOP_BASE = "5.25rem"
const STACK_TOP_STEP = "0.4rem"

type CategoriesSectionProps = {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) {
    return null
  }

  return (
    <MotionSection
      id="explore"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUpSubtle}
      className="section-y"
    >
      <Container>
        <MotionDiv variants={fadeUpSubtle}>
          <SectionHeader
            eyebrow={siteCopy.categories.eyebrow}
            title={siteCopy.categories.title}
            subtitle={siteCopy.categories.subtitle}
            action={
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                View all services
                <ArrowRightIcon className="size-4" />
              </Link>
            }
          />
        </MotionDiv>

        <div className="services-stack mt-10" aria-label="Service categories">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="services-stack-item"
              style={{
                zIndex: index + 1,
                ["--stack-top" as string]: `calc(${STACK_TOP_BASE} + ${index} * ${STACK_TOP_STEP})`,
              }}
            >
              <CategoryStackCard category={category} index={index} total={categories.length} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center sm:mt-8">
          <Button asChild variant="outline" className="px-8">
            <Link href="/services">
              View all services
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </MotionSection>
  )
}
