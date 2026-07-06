import type { Metadata } from "next"
import { Bricolage_Grotesque, Inter, Sora } from "next/font/google"
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
    default: "Glamzzo · Salon booking, made calm",
    template: "%s · Glamzzo",
  },
  description:
    "Discover trusted salons in Bengaluru, compare services with upfront pricing, and book appointments in minutes.",
  metadataBase: new URL("https://glamzzo.com"),
  openGraph: {
    title: "Glamzzo · Salon booking, made calm",
    description:
      "Discover trusted salons in Bengaluru, compare services with upfront pricing, and book in minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glamzzo",
    description:
      "Discover nearby salons, compare services, and reserve appointments effortlessly.",
  },
  icons: {
    icon: [{ url: "/brand/glamzzo-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/glamzzo-icon.svg" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${logoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-clip bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
