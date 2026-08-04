import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Inter, Sora } from "next/font/google"

import { LocationBootstrap } from "@/components/layout/location-bootstrap"
import { NavigationScrollManager } from "@/components/layout/navigation-scroll-manager"
import { getSalons } from "@/lib/salons"
import { SEO_HOME, SITE_URL } from "@/lib/seo/site-seo"
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
    default: SEO_HOME.title,
    template: "%s · Glammzo",
  },
  description: SEO_HOME.description,
  metadataBase: new URL(SITE_URL),
  applicationName: "Glammzo",
  keywords: [...SEO_HOME.keywords],
  authors: [{ name: "Glammzo" }],
  creator: "Glammzo",
  publisher: "Fixxzo Technologies Private Limited",
  category: "beauty",
  openGraph: {
    title: SEO_HOME.title,
    description: SEO_HOME.description,
    type: "website",
    siteName: "Glammzo",
    locale: "en_IN",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_HOME.title,
    description: SEO_HOME.description,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f4f1",
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
