"use client"

import { motion } from "framer-motion"
import { Heart, Zap, Shield } from "lucide-react"

export function OurMission() {
  return (
    <section className="bg-gradient-to-br from-accent-lilac/5 via-background to-primary/5 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Nuestra misión</h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Conectar talento excepcional con empresas innovadoras, eliminando fricciones y acelerando el crecimiento
            mutuo.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Zap className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-foreground">Velocidad sin sacrificar calidad</h3>
            <p className="leading-relaxed text-muted-foreground">
              Creemos que rapidez y excelencia no son opuestos. Nuestra tecnología y metodología lo demuestran cada día.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Heart className="h-8 w-8 text-accent" aria-hidden="true" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-foreground">Enfoque humano</h3>
            <p className="leading-relaxed text-muted-foreground">
              La tecnología potencia, pero las personas deciden. Validamos cada candidato con criterio experto y
              empatía.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10">
              <Shield className="h-8 w-8 text-accent-blue" aria-hidden="true" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-foreground">Compromiso con resultados</h3>
            <p className="leading-relaxed text-muted-foreground">
              Nuestra garantía de 15 días no es marketing: es el reflejo de nuestra confianza en lo que hacemos.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
