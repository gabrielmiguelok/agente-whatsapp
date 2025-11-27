"use client"

import { motion } from "framer-motion"
import { Phone, Search, CheckCircle, Rocket, Clock } from "lucide-react"

export function Methodology() {
  const steps = [
    {
      icon: Phone,
      number: "01",
      title: "20 MINUTOS QUE CAMBIAN TODO",
      subtitle: "Conociendo tu necesidad",
      description: "Hablamos. Entendemos qué necesita tu empresa y qué perfil buscás. Sin formularios eternos.",
      duration: "20 min",
    },
    {
      icon: Search,
      number: "02",
      title: "NUESTRO EQUIPO BUSCA (VOS NO)",
      subtitle: "Búsqueda activa",
      description: "Usamos el método Allá Vamos: LinkedIn, headhunting activo y validación profunda.",
      duration: "Continuo",
    },
    {
      icon: CheckCircle,
      number: "03",
      title: "72H: PRIMERA SELECCIÓN",
      subtitle: "Candidatos validados",
      description: "En menos de 3 días tenés candidatos validados. Con experiencia real. Referencias chequeadas.",
      duration: "72h",
    },
    {
      icon: Rocket,
      number: "04",
      title: "15 DÍAS: CONTRATACIÓN",
      subtitle: "Acompañamiento completo",
      description: "Desde el día 1 hasta la firma: 15 días promedio. Te acompañamos en todo.",
      duration: "15 días",
    },
  ]

  return (
    <section
      id="proceso"
      className="relative py-20 lg:py-32 bg-gradient-to-b from-background via-accent/5 to-background overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            ASÍ FUNCIONA
            <br />
            <span className="text-primary">ALLÁ VAMOS</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Un proceso probado que reduce tiempos y aumenta aciertos.
          </p>
        </motion.div>

        {/* Mobile: Vertical timeline */}
        <div className="lg:hidden space-y-6 max-w-md mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-[2rem] border border-border bg-card p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-bold text-primary/20">{step.number}</span>
                    </div>
                    <h3 className="font-bold text-base">{step.title}</h3>
                    <p className="text-sm text-primary font-medium">{step.subtitle}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">{step.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tablet: 2x2 grid */}
        <div className="hidden lg:hidden md:grid grid-cols-2 gap-6 max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-[2.5rem] border border-border bg-card p-8 space-y-4 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="text-5xl font-bold text-primary/20">{step.number}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-sm text-primary font-medium">{step.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{step.duration}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Desktop: Horizontal flow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-20 left-0 right-0 h-0.5 bg-border" />

            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-[2.5rem] border border-border bg-card p-8 space-y-6 shadow-xl hover:shadow-2xl transition-all group"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative z-10">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                      <span className="text-6xl font-bold text-primary/20">{step.number}</span>
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg leading-tight">{step.title}</h3>
                        <p className="text-sm text-primary font-medium">{step.subtitle}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{step.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
