// app/login/page.tsx
"use client"

import type React from "react"
import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, LockIcon as CapsLock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

/** Importante:
 *  - NO exportamos `revalidate` aquí (causaba el error).
 *  - Lo mantenemos como página dinámica y sin cache implícito por su naturaleza de login.
 */
export const dynamic = "force-dynamic"

function resolveDest(role: string | null | undefined, nextParam?: string | null): string {
  if (role !== "admin") {
    return "/no-autorizado"
  }
  if (nextParam && nextParam.startsWith("/") && nextParam !== "/login" && !nextParam.startsWith("//")) {
    return nextParam
  }
  return "/"
}

/* ========= Wrapper con Suspense (obligatorio para useSearchParams) ========= */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            Cargando…
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}

/* ====================== Client real de la página ====================== */
function LoginClient() {
  const search = useSearchParams()
  const nextParam = useMemo(() => search.get("next"), [search])

  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })

  // Si ya hay sesión, redirige antes de mostrar el formulario (respeta ?next=)
  useEffect(() => {
    let ignore = false
    const check = async () => {
      try {
        const res = await fetch("/api/auth/verify", { cache: "no-store" })
        if (!ignore && res.ok) {
          const data = await res.json()
          const role = data?.user?.role as string | null | undefined
          const dest = resolveDest(role, nextParam)
          window.location.replace(dest)
          return
        }
      } catch {
        // sin sesión o error → seguir en /login
      } finally {
        if (!ignore) setCheckingSession(false)
      }
    }
    check()
    return () => { ignore = true }
  }, [nextParam])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"))
    window.addEventListener("keydown", handleKey)
    window.addEventListener("keyup", handleKey)
    return () => {
      window.removeEventListener("keydown", handleKey)
      window.removeEventListener("keyup", handleKey)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden")
        setIsLoading(false)
        return
      }
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error en la autenticación")

      if (isLogin) {
        const role = data?.user?.role as string | null | undefined
        const dest = resolveDest(role, nextParam)
        setSuccess("¡Inicio de sesión exitoso!")
        setTimeout(() => window.location.replace(dest), 200)
      } else {
        setSuccess("¡Cuenta creada exitosamente!")
        setTimeout(() => {
          setIsLogin(true)
          setSuccess("")
        }, 1200)
      }
    } catch (err: any) {
      setError(err.message || "Error en la autenticación. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = (password: string) =>
    (Number(password.length >= 8) +
      Number(/[A-Z]/.test(password)) +
      Number(/[a-z]/.test(password)) +
      Number(/[0-9]/.test(password)) +
      Number(/[^A-Za-z0-9]/.test(password)))

  const getStrengthColor = (s: number) => (s <= 2 ? "bg-red-500" : s <= 3 ? "bg-yellow-500" : "bg-green-500")
  const getStrengthText = (s: number) => (s <= 2 ? "Débil" : s <= 3 ? "Media" : "Fuerte")

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Verificando sesión...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-4 pb-6">
                <div className="text-center">
                  <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {isLogin ? "Bienvenido" : "Crear cuenta"}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {isLogin ? "Inicia sesión para continuar" : "Crea tu cuenta para comenzar"}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" name="firstName" type="text" required={!isLogin}
                          value={formData.firstName} onChange={handleInputChange} className="h-11" placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" name="lastName" type="text" required={!isLogin}
                          value={formData.lastName} onChange={handleInputChange} className="h-11" placeholder="Tu apellido" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input id="email" name="email" type="email" required value={formData.email}
                        onChange={handleInputChange} className="h-11 pl-10" placeholder="tu@email.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} required
                        value={formData.password} onChange={handleInputChange} className="h-11 pl-10 pr-20" placeholder="••••••••" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {capsLockOn && <CapsLock className="w-4 h-4 text-yellow-500" title="Caps Lock activado" />}
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </Button>
                      </div>
                    </div>

                    {!isLogin && formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Seguridad de la contraseña:</span>
                          <span className={`font-medium ${passwordStrength(formData.password) <= 2 ? "text-red-600"
                            : passwordStrength(formData.password) <= 3 ? "text-yellow-600" : "text-green-600"}`}>
                            {getStrengthText(passwordStrength(formData.password))}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength(formData.password))}`}
                            style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                          required={!isLogin} value={formData.confirmPassword} onChange={handleInputChange}
                          className="h-11 pl-10 pr-10" placeholder="••••••••" />
                        <Button type="button" variant="ghost" size="sm"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                      </div>
                    ) : isLogin ? "Iniciar sesión" : "Crear cuenta"}
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                    <Button
                      variant="link"
                      className="p-0 ml-1 h-auto font-semibold text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setError("")
                        setSuccess("")
                        setFormData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" })
                      }}
                    >
                      {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
