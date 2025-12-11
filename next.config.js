/** @typedef {import('next').NextConfig} */

/* Bundle analyzer opcional */
const withBundleAnalyzer = (() => {
  if (process.env.ANALYZE !== "true") return (cfg) => cfg
  try {
    const analyzer = require("@next/bundle-analyzer")({ enabled: true })
    return analyzer
  } catch {
    console.warn("[next.config] @next/bundle-analyzer no instalado. Saltando ANALYZE.")
    return (cfg) => cfg
  }
})()

/** @type {NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  outputFileTracingRoot: __dirname,

  serverExternalPackages: [
    '@whiskeysockets/baileys',
    'ws',
    'libsignal',
    'link-preview-js',
    'sharp',
    'qrcode-terminal',
    'pino',
    'exceljs',
  ],

  turbopack: {},

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },

  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    return [{ source: "/no-redirect", destination: "/" }]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
