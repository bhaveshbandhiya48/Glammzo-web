/**
 * Glamzzo media — curated salon & beauty-service photography.
 * Sources: Unsplash + Pexels (free licenses; credit links in src/data/media-credits.ts).
 *
 * Run: npm run media:sync
 */
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

/** @type {Record<string, { url: string; credit: string }>} */
const assets = {
  // —— Service categories (in-salon, booking-relevant) ——
  "public/images/categories/hair.jpg": {
    url: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1920&q=85&auto=format&fit=crop",
    credit: "Unsplash — woman getting a haircut at a salon",
  },
  "public/images/categories/spa.jpg": {
    url: "https://images.pexels.com/photos/8524528/pexels-photo-8524528.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — facial / spa treatment",
  },
  "public/images/categories/nails.jpg": {
    url: "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — manicure at nail studio",
  },
  "public/images/categories/makeup.jpg": {
    url: "https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — professional makeup application",
  },
  "public/images/categories/grooming.jpg": {
    url: "https://images.pexels.com/photos/3998393/pexels-photo-3998393.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — barber grooming client",
  },

  // —— Partner salon cards (warm, premium interiors & spaces) ——
  "public/images/salons/s1.jpg": {
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=85&auto=format&fit=crop",
    credit: "Unsplash — modern hair salon interior",
  },
  "public/images/salons/s2.jpg": {
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&q=85&auto=format&fit=crop",
    credit: "Unsplash — spa / wellness setting",
  },
  "public/images/salons/s3.jpg": {
    url: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — nail salon workspace",
  },
  "public/images/salons/s4.jpg": {
    url: "https://images.pexels.com/photos/3992872/pexels-photo-3992872.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — makeup station in salon",
  },

  // —— Hero & marketing ——
  "public/images/hero/featured.jpg": {
    url: "https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — hairstylist working in salon",
  },
  "public/images/sections/featured-experience.jpg": {
    url: "https://images.pexels.com/photos/3998394/pexels-photo-3998394.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — hair styling appointment",
  },
  "public/images/sections/mobile-app.jpg": {
    url: "https://images.pexels.com/photos/5069437/pexels-photo-5069437.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — beauty salon interior",
  },
  "public/images/auth/salon.jpg": {
    url: "https://images.pexels.com/photos/3738222/pexels-photo-3738222.jpeg?auto=compress&cs=tinysrgb&w=1920",
    credit: "Pexels — client in beauty salon",
  },

  // —— Testimonial avatars (natural portraits) ——
  "public/images/testimonials/t1.jpg": {
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512&q=85&auto=format&fit=crop&crop=faces",
    credit: "Unsplash",
  },
  "public/images/testimonials/t2.jpg": {
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=512&q=85&auto=format&fit=crop&crop=faces",
    credit: "Unsplash",
  },
  "public/images/testimonials/t3.jpg": {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&q=85&auto=format&fit=crop&crop=faces",
    credit: "Unsplash",
  },
}

for (const [rel, { url }] of Object.entries(assets)) {
  const dest = join(root, rel)
  await mkdir(dirname(dest), { recursive: true })
  const res = await fetch(url, { redirect: "follow" })
  if (!res.ok) throw new Error(`Failed ${rel}: ${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 20_000) {
    throw new Error(`Suspiciously small file for ${rel} (${buf.length} bytes)`)
  }
  await writeFile(dest, buf)
  console.log("Saved", rel, `(${(buf.length / 1024).toFixed(0)} KB)`)
}

console.log("Done — Glamzzo media synced (Unsplash + Pexels).")
