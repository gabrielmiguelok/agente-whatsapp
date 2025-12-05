"use client"

import { useEffect, useRef } from "react"

interface PromoBannerProps {
  messages?: string[]
  speed?: number
  className?: string
}

const defaultMessages = [
  "🚀 LANZAMIENTO: Automatizá tu WhatsApp con IA",
  "💬 Respondé 24/7 sin estar conectado",
  "✅ Probá GRATIS por 14 días",
  "🔥 50% OFF en planes anuales",
]

export default function PromoBanner({
  messages = defaultMessages,
  speed = 50,
  className = ""
}: PromoBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    const content = contentRef.current
    if (!scrollContainer || !content) return

    let animationId: number
    let position = 0
    const contentWidth = content.offsetWidth / 2

    const animate = () => {
      position -= 1
      if (Math.abs(position) >= contentWidth) {
        position = 0
      }
      content.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    const intervalId = setInterval(() => {
      cancelAnimationFrame(animationId)
      animationId = requestAnimationFrame(animate)
    }, speed)

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(intervalId)
    }
  }, [speed])

  const messageText = messages.join("   •   ")

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 h-10 flex items-center overflow-hidden ${className}`}
    >
      <div ref={scrollRef} className="w-full overflow-hidden">
        <div
          ref={contentRef}
          className="inline-flex whitespace-nowrap will-change-transform"
          style={{ width: "max-content" }}
        >
          <span className="text-white font-bold text-sm tracking-wide px-4">
            {messageText}   •   {messageText}   •
          </span>
        </div>
      </div>
    </div>
  )
}
