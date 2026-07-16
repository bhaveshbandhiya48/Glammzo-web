"use client"

import { LockIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MotionDiv, MotionSection, fadeUp } from "@/components/shared/motion"

export function LoginSection() {
  return (
    <MotionSection
      id="login"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-120px" }}
      className="section-y"
    >
      <Container>
        <MotionDiv variants={fadeUp}>
          <Card className="rounded-[2.25rem]">
            <CardContent className="grid gap-6 p-8 md:grid-cols-[1.25fr_0.75fr] md:items-center md:p-12">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1 text-sm font-medium text-foreground/70 ring-1 ring-black/[0.05] backdrop-blur">
                  <LockIcon className="size-4" />
                  Your account
                </div>
                <h2 className="mt-4 text-2xl sm:text-3xl">Log in to rebook faster</h2>
                <p className="mt-2 text-sm leading-6 text-foreground/65 sm:text-base">
                  Save favorites, manage appointments, and rebook with one tap, all in a calm, premium experience.
                </p>
              </div>
              <div className="grid gap-2">
                <Button size="lg">Continue</Button>
                <Button variant="outline" size="lg">
                  Create account
                </Button>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}

