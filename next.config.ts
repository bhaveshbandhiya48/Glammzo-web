import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // macOS/local DNS often resolves *.supabase.co via NAT64 (64:ff9b::…), which
    // Next treats as a private IP and blocks in the image optimizer. Safe here
    // because remotePatterns still restrict which hosts can be fetched.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Suppress future Next.js dev warning for LAN testing (optional, but keeps console clean).
  allowedDevOrigins: ["http://localhost:4008"],
  async redirects() {
    return [
      {
        source: "/salons-in-bangalore",
        destination: "/salons-in/bengaluru",
        permanent: true,
      },
      {
        source: "/salon-in-bengaluru",
        destination: "/salons-in/bengaluru",
        permanent: true,
      },
      {
        source: "/salon-in-bangalore",
        destination: "/salons-in/bengaluru",
        permanent: true,
      },
      {
        source: "/hair-salon-in-bangalore",
        destination: "/hair-salon-in-bengaluru",
        permanent: true,
      },
      {
        source: "/spa-in-bangalore",
        destination: "/spa-in-bengaluru",
        permanent: true,
      },
      {
        source: "/nail-salon-in-bangalore",
        destination: "/nail-salon-in-bengaluru",
        permanent: true,
      },
      {
        source: "/beauty-parlour-in-bangalore",
        destination: "/beauty-parlour-in-bengaluru",
        permanent: true,
      },
      {
        source: "/unisex-salon-in-bangalore",
        destination: "/unisex-salon-in-bengaluru",
        permanent: true,
      },
      {
        source: "/best-salons-in-bangalore",
        destination: "/best-salons-in-bengaluru",
        permanent: true,
      },
      {
        source: "/999-off",
        destination: "/get-999-off",
        permanent: true,
      },
      {
        source: "/every-10th-service-free",
        destination: "/get-999-off",
        permanent: true,
      },
      {
        source: "/free-salon-service-bengaluru",
        destination: "/get-999-off",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
