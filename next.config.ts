import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  // Suppress future Next.js dev warning for LAN testing (optional, but keeps console clean).
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.10:3000"],
}

export default nextConfig
