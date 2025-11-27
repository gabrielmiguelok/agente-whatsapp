"use client"

import { motion } from "framer-motion"
import { Sparkles, Target, Users } from "lucide-react"

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent-lilac/5 to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Sobre AlaTalento
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground">
              Revolucionamos el reclutamiento con{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-accent-blue bg-clip-text text-transparent">
                IA y pasión
              </span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Somos un equipo comprometido con conectar talento excepcional con empresas que buscan crecer sin límites.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <Target className="mx-auto mb-3 h-8 w-8 text-primary" aria-hidden="true" />
              <p className="text-2xl font-bold text-foreground">15 días</p>
              <p className="text-sm text-muted-foreground">Garantía de contratación</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden="true" />
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Posiciones cubiertas</p>
            </div>
          </motion.div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Sobre AlaTalento
              </div>
              <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground xl:text-6xl">
                Revolucionamos el reclutamiento con{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-accent-blue bg-clip-text text-transparent">
                  IA y pasión
                </span>
              </h1>
              <p className="text-xl leading-relaxed text-muted-foreground">
                Somos un equipo comprometido con conectar talento excepcional con empresas que buscan crecer sin
                límites. Combinamos tecnología de punta con un enfoque humano.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
                <Target className="mx-auto mb-4 h-12 w-12 text-primary" aria-hidden="true" />
                <p className="text-4xl font-bold text-foreground">15 días</p>
                <p className="mt-2 text-muted-foreground">Garantía de contratación</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
                <Users className="mx-auto mb-4 h-12 w-12 text-accent" aria-hidden="true" />
                <p className="text-4xl font-bold text-foreground">500+</p>
                <p className="mt-2 text-muted-foreground">Posiciones cubiertas</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
