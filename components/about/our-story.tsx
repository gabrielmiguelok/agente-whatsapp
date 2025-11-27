"use client"

import { motion } from "framer-motion"
import { Calendar, Lightbulb, Rocket } from "lucide-react"

const milestones = [
  {
    year: "2020",
    title: "El comienzo",
    description:
      "Identificamos la frustración de empresas que perdían meses buscando talento. Decidimos cambiar las reglas del juego.",
    icon: Lightbulb,
  },
  {
    year: "2021",
    title: "Primeros clientes",
    description:
      "Lanzamos nuestra metodología de 15 días y ayudamos a 50 empresas a cubrir posiciones críticas en tiempo récord.",
    icon: Rocket,
  },
  {
    year: "2023",
    title: "Expansión e IA",
    description:
      "Integramos IA y automatización para escalar sin perder calidad. Superamos las 500 posiciones cubiertas exitosamente.",
    icon: Calendar,
  },
]

export function OurStory() {
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
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Nuestra historia</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Desde el día uno, nos propusimos transformar la forma en que las empresas encuentran y contratan talento
            excepcional.
          </p>
        </motion.div>

        {/* Mobile: Vertical Timeline */}
        <div className="block lg:hidden space-y-8">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon
            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-12"
              >
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <p className="mb-2 text-sm font-semibold text-primary">{milestone.year}</p>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{milestone.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon
            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <div className="rounded-3xl border border-border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
                  <p className="mb-3 text-sm font-semibold text-primary">{milestone.year}</p>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">{milestone.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
