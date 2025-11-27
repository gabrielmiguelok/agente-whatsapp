"use client"

import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

export function ValueProposition() {
  const problems = [
    "Mientras buscás el perfil ideal, tu competencia ya contrató.",
    "Mientras filtrás CVs sin sentido, perdés facturación.",
    "Mientras esperás que RRHH encuentre 'al indicado', tu proyecto se frena.",
  ]

  return (
    <section
      id="propuesta"
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
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            TU EQUIPO NO PUEDE
            <br />
            <span className="text-primary">ESPERAR MESES</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">TU NEGOCIO TAMPOCO.</p>
        </motion.div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6 max-w-md mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-destructive/20 bg-destructive/5 p-6 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{problem}</p>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-primary bg-primary p-8 text-center space-y-4 shadow-xl"
          >
            <p className="text-primary-foreground font-semibold text-base leading-relaxed">
              Nosotros encontramos, validamos y te presentamos profesionales listos para arrancar. En 15 días o menos.
            </p>
          </motion.div>

          <p className="text-center text-xl font-bold text-accent">No es magia. Es método.</p>
        </div>

        {/* Tablet Layout */}
        <div className="hidden lg:hidden md:block max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">{problem}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border border-primary bg-primary p-10 text-center shadow-xl"
          >
            <p className="text-primary-foreground font-bold text-xl leading-relaxed">
              Nosotros encontramos, validamos y te presentamos profesionales listos para arrancar. En 15 días o menos.
            </p>
          </motion.div>

          <p className="text-center text-2xl font-bold text-accent">No es magia. Es método.</p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-10 space-y-4 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className="h-16 w-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{problem}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] border border-primary bg-primary p-16 text-center shadow-xl"
          >
            <p className="text-primary-foreground font-bold text-3xl leading-relaxed max-w-5xl mx-auto">
              Nosotros encontramos, validamos y te presentamos profesionales listos para arrancar. En 15 días o menos.
            </p>
          </motion.div>

          <p className="text-center text-4xl font-bold text-accent">No es magia. Es método.</p>
        </div>
      </div>
    </section>
  )
}
