"use client"

import Link from "next/link"
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
                <h2 className="mt-4 text-2xl sm:text-3xl">Continue with your mobile number</h2>
                <p className="mt-2 text-sm leading-6 text-foreground/65 sm:text-base">
                  Save favorites, manage appointments, and rebook with one tap — we&apos;ll create
                  your account the first time you verify.
                </p>
              </div>
              <div className="grid gap-2">
                <Button asChild size="lg">
                  <Link href="/login">Continue with mobile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </Container>
    </MotionSection>
  )
}
