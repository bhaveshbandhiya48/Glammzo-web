import type { Metadata } from "next"
import { Bricolage_Grotesque, Inter, Sora } from "next/font/google"

import { LocationBootstrap } from "@/components/layout/location-bootstrap"
import { NavigationScrollManager } from "@/components/layout/navigation-scroll-manager"
import { getSalons } from "@/lib/salons"
import { ExploreDistanceOriginProvider } from "@/providers/explore-distance-origin-provider"
import { SalonCatalogProvider } from "@/providers/salon-catalog-provider"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
})

const logoFont = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Glammzo · Salon booking, made calm",
    template: "%s · Glammzo",
  },
  description:
    "Discover trusted salons, compare services with upfront pricing, and book appointments in minutes.",
  metadataBase: new URL("https://glammzo.com"),
  openGraph: {
    title: "Glammzo · Salon booking, made calm",
    description:
      "Discover trusted salons, compare services with upfront pricing, and book in minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glammzo",
    description:
      "Discover nearby salons, compare services, and reserve appointments effortlessly.",
  },
  icons: {
    icon: [{ url: "/brand/glamzzo-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/glamzzo-icon.svg" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Glammzo",
    statusBarStyle: "default",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialSalons = await getSalons()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${logoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full overflow-x-clip bg-background text-foreground"
        suppressHydrationWarning
      >
        <LocationBootstrap />
        <NavigationScrollManager />
        <ExploreDistanceOriginProvider>
          <SalonCatalogProvider initialSalons={initialSalons}>
            {children}
          </SalonCatalogProvider>
        </ExploreDistanceOriginProvider>
      </body>
    </html>
  )
}
