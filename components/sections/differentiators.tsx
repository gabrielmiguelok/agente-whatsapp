"use client"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

const differentiators = [
  {
    title: "MÉTODO VALIDADO",
    description: "Proceso probado que reduce tiempos y aumenta aciertos.",
    benefits: ["Framework estructurado", "Métricas verificables", "Casos de éxito reales"],
    gradient: "from-primary/20 via-accent/20 to-primary/10",
  },
  {
    title: "VELOCIDAD REAL",
    description: "72 horas primera selección. 15 días contratación completa.",
    benefits: ["Pipeline en 72h", "Garantía 15 días", "Sin comprometer calidad"],
    gradient: "from-accent/20 via-accent-blue/20 to-accent/10",
  },
  {
    title: "ESPECIALISTAS EN LINKEDIN",
    description: "Todo nuestro expertise al servicio de tu empresa.",
    benefits: ["Sourcing activo", "Automatizaciones", "Red de +50K contactos"],
    gradient: "from-accent-blue/20 via-primary/20 to-accent-blue/10",
  },
  {
    title: "ACOMPAÑAMIENTO HUMANO",
    description: "Desde primera llamada hasta onboarding, estamos con vos.",
    benefits: ["Consultor dedicado", "Reportes en tiempo real", "Feedback continuo"],
    gradient: "from-primary/15 via-accent/15 to-accent-blue/20",
  },
  {
    title: "SIN LETRA CHICA",
    description: "Precios claros. Procesos transparentes. Resultados medibles.",
    benefits: ["Pricing transparente", "Sin costos ocultos", "ROI medible"],
    gradient: "from-accent/15 via-accent-lilac/20 to-primary/15",
  },
]

export function Differentiators() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background via-accent/5 to-background overflow-hidden">
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">¿POR QUÉ NOSOTROS?</h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Lo que nos hace diferentes en el mercado de reclutamiento.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* First two cards - larger on desktop */}
          {differentiators.slice(0, 2).map((diff, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-[2.5rem] p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${diff.gradient} opacity-50 group-hover:opacity-70 transition-opacity`}
              />
              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">{diff.title}</h3>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">{diff.description}</p>
                <div className="space-y-3">
                  {diff.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-base text-foreground font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Remaining three cards in a row on desktop, stacked on mobile */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {differentiators.slice(2).map((diff, index) => (
              <motion.div
                key={index + 2}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 2) * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${diff.gradient} opacity-50 group-hover:opacity-70 transition-opacity`}
                />
                <div className="relative z-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">{diff.title}</h3>
                  <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-4">{diff.description}</p>
                  <div className="space-y-2">
                    {diff.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-foreground font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
