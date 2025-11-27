"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users, Target, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-32 lg:pt-24">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mobile Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:hidden text-center space-y-8"
        >
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-balance">
              Contratá el <span className="text-primary">talento</span> que tu empresa necesita
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">En 72 horas. Validado. Sin vueltas.</p>
          </div>

          {/* Metrics cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, value: "72h", label: "Primera selección" },
              { icon: Users, value: "15 días", label: "Contratación" },
              { icon: Target, value: "+45%", label: "Más rápido" },
              { icon: Zap, value: "-36%", label: "Menos rotación" },
            ].map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="rounded-[2rem] border border-border bg-card p-6 space-y-3 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="space-y-3">
            <Button size="lg" asChild className="w-full">
              <a href="mailto:contacto@allavamos.com">
                Hablemos de tu equipo
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Tablet Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:hidden md:block max-w-4xl mx-auto text-center space-y-10"
        >
          <div className="space-y-6">
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight text-balance">
              Contratá el <span className="text-primary">talento</span> que tu empresa necesita
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              En 72 horas. Validado. Sin vueltas.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Clock, value: "72h", label: "Primera selección" },
              { icon: Users, value: "15 días", label: "Contratación" },
              { icon: Target, value: "+45%", label: "Más rápido" },
              { icon: Zap, value: "-36%", label: "Menos rotación" },
            ].map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="rounded-[2rem] border border-border bg-card p-6 space-y-3 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-primary">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <Button size="lg" asChild>
            <a href="mailto:contacto@allavamos.com">
              Hablemos de tu equipo
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </motion.div>

        {/* Desktop Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block max-w-7xl mx-auto"
        >
          <div className="text-center space-y-12">
            <div className="space-y-8">
              <h1 className="text-6xl xl:text-7xl font-bold leading-tight text-balance">
                Contratá el <span className="text-primary">talento</span> que tu empresa necesita
              </h1>
              <p className="text-2xl xl:text-3xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                En 72 horas. Validado. Sin vueltas.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Clock, value: "72h", label: "Primera selección" },
                { icon: Users, value: "15 días", label: "Contratación completa" },
                { icon: Target, value: "+45%", label: "Más rápido que el mercado" },
                { icon: Zap, value: "-36%", label: "Menos rotación" },
              ].map((metric, index) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="rounded-[2.5rem] border border-border bg-card p-8 space-y-4 shadow-xl hover:shadow-2xl transition-all group"
                  >
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-primary">{metric.value}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{metric.label}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href="mailto:contacto@allavamos.com">
                Hablemos de tu equipo
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
