"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { buildColumnsFromDefinition } from "@/CustomTable/CustomTableColumnsConfig"
import CustomTable from "@/CustomTable"
import { useRouter } from "next/navigation"

const usersColumns = buildColumnsFromDefinition({
  id: { type: "numeric", header: "ID", width: 60, editable: false },
  email: { type: "text", header: "EMAIL", width: 250 },
  full_name: { type: "avatar", header: "NOMBRE", width: 200 },
  role: {
    type: "badge",
    header: "ROL",
    width: 120,
    options: [
      { value: "admin", label: "admin" },
      { value: "user", label: "user" },
    ],
  },
  created_at: { type: "date", header: "CREADO", width: 160, editable: false },
  updated_at: { type: "date", header: "ACTUALIZADO", width: 160, editable: false },
})

interface User {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export default function HomePage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string | null } | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/verify")
      if (response.ok) {
        const data = await response.json()
        setCurrentUser({ email: data.user.email, name: data.user.name })
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [fetchUsers, fetchCurrentUser])

  const handleCellEdit = async (rowId: string, colId: string, newValue: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowId, field: colId, value: newValue }),
      })
      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id.toString() === rowId ? { ...user, [colId]: newValue } : user
          )
        )
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gestión de usuarios</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser.name || currentUser.email}
                  </p>
                  <p className="text-xs text-emerald-500">Administrador</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Usuarios del Sistema</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Administrá los usuarios y sus permisos. Cambiá el rol a "admin" para otorgar acceso completo.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
              <CustomTable
                data={users}
                columnsDef={usersColumns}
                pageSize={50}
                loading={loading}
                showFiltersToolbar={true}
                containerHeight="100%"
                rowHeight={36}
                onCellEdit={handleCellEdit}
                onRefresh={fetchUsers}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          CRM Onia - Panel de Administración
        </div>
      </footer>
    </div>
  )
}
