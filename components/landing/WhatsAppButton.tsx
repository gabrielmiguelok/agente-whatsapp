"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { useState } from "react"

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false)

  const whatsappNumber = "5492364655702"
  const message = encodeURIComponent("¡Hola! Me interesa saber más sobre Agente WhatsApp para automatizar mis ventas.")
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
      className="fixed right-6 z-[55]"
      style={{ bottom: "var(--whatsapp-bottom-offset, 24px)" }}
    >
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 group px-4 py-3"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-bold text-sm whitespace-nowrap md:hidden">
          ¡Hablemos!
        </span>
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: isHovered ? "auto" : 0,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="hidden md:block overflow-hidden whitespace-nowrap font-bold text-sm"
        >
          ¡Hablemos!
        </motion.span>
      </motion.a>

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full -z-10"
      />
    </motion.div>
  )
}
