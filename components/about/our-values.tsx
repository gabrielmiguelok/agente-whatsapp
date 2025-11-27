"use client"

import { motion } from "framer-motion"
import { Sparkles, Users, TrendingUp, Award } from "lucide-react"

const values = [
  {
    icon: Sparkles,
    title: "Innovación constante",
    description: "Adoptamos nuevas tecnologías y metodologías para mantenernos a la vanguardia del reclutamiento.",
  },
  {
    icon: Users,
    title: "Colaboración genuina",
    description: "Trabajamos codo a codo con nuestros clientes, entendiendo sus necesidades y cultura empresarial.",
  },
  {
    icon: TrendingUp,
    title: "Mejora continua",
    description: "Cada proceso es una oportunidad para aprender, optimizar y entregar mejores resultados.",
  },
  {
    icon: Award,
    title: "Excelencia sin excusas",
    description: "No nos conformamos con lo suficiente. Buscamos la excelencia en cada candidato y cada interacción.",
  },
]

export function OurValues() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Nuestros valores</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Los principios que guían cada decisión y cada interacción con clientes y candidatos.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-3xl border border-border bg-card p-8 shadow-lg transition-all hover:shadow-xl hover:border-primary/50"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 transition-transform group-hover:scale-110">
                  <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{value.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{value.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
