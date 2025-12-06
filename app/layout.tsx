import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
})

const brandName = "Nexus CRM"
const brandTitleDefault = "Nexus CRM | Automatización Inteligente de WhatsApp con IA"
const brandTitleTemplate = "%s | Nexus CRM"
const brandDescription =
  "Nexus CRM: Plataforma de automatización de WhatsApp con inteligencia artificial. Gestiona contactos, mensajes y conversaciones automáticas con IA que califica leads en tiempo real. CRM inmobiliario inteligente."
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://delegar.space"

const ogImage = `${baseUrl}/preview.png`
const ogIcon = `${baseUrl}/icon-512x512.png`

export const dynamic = "force-static"
export const revalidate = false

export const metadata: Metadata = {
  title: {
    default: brandTitleDefault,
    template: brandTitleTemplate,
  },
  description: brandDescription,
  keywords:
    "crm whatsapp, automatización whatsapp, chatbot ia, whatsapp business api, crm inmobiliario, lead qualification, inteligencia artificial, whatsapp automation, nexus crm, gestión contactos, mensajería automatizada, bot whatsapp",
  authors: [{ name: brandName, url: baseUrl }],
  creator: brandName,
  publisher: brandName,
  formatDetection: { email: true, address: true, telephone: true },
  metadataBase: new URL(baseUrl),
  alternates: { canonical: "/" },

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/icon-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/icon-512x512.png", sizes: "512x512" },
      { rel: "mask-icon", url: "/maskable-icon-512x512.png" },
    ],
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "es_AR",
    url: baseUrl,
    title: brandTitleDefault,
    description: brandDescription,
    siteName: brandName,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Nexus CRM - Automatización Inteligente de WhatsApp",
        type: "image/png",
      },
      {
        url: ogIcon,
        width: 512,
        height: 512,
        alt: "Nexus CRM Logo",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: brandTitleDefault,
    description: brandDescription,
    images: [ogImage, ogIcon],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "Next.js",
  applicationName: brandName,
  referrer: "origin-when-cross-origin",
  category: "business",

  other: {
    "contact:email": "contacto@onia.agency",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="canonical" href={baseUrl} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": baseUrl,
              name: brandName,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              description: brandDescription,
              url: baseUrl,
              image: [ogImage, ogIcon],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              author: {
                "@type": "Organization",
                name: brandName,
                url: baseUrl,
              },
              softwareVersion: "2.0.0",
              programmingLanguage: ["TypeScript", "React", "Next.js"],
              keywords: "CRM, WhatsApp, Automatización, IA, Inteligencia Artificial",
            }),
          }}
        />
      </head>
      <body
        className={`font-sans ${inter.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
