import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
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
}

export default nextConfig
