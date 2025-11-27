"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function NoAutorizadoPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-3">
            Acceso Restringido
          </h1>

          <p className="text-gray-400 mb-6">
            Tu cuenta no tiene permisos de administrador para acceder al sistema.
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-sm text-gray-300">
              Contactá a un administrador para que te otorgue los permisos necesarios.
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = "/"}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              Verificar permisos nuevamente
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all border border-white/10"
            >
              Cerrar sesión
            </motion.button>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Si crees que esto es un error, contactá al soporte técnico.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
