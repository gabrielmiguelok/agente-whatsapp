"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Zap, Clock, Shield, Target, Briefcase, FileCheck } from "lucide-react"

const faqs = [
  {
    question: "¿Qué pasa si no cumplimos el plazo de 15 días?",
    answer: `**Garantía sin riesgos:**

- **Devolución parcial del fee** según el retraso
- **Extensión del sprint sin costo adicional**
- **Prioridad absoluta** en tu búsqueda
- **Transparencia total** en el proceso

**Resultado:** tu tranquilidad es nuestra prioridad.`,
    category: "Garantía",
    icon: Shield,
    popular: true,
  },
  {
    question: "¿Qué roles cubren exactamente?",
    answer: `**Cobertura completa:**

- **Tech:** Developers, DevOps, QA, Product Managers
- **Ventas:** SDRs, Account Executives, CSMs
- **Marketing:** Growth, Content, Performance
- **Operaciones:** Project Managers, Analysts

**Plus:** perfiles específicos con plan ad-hoc diseñado para ti.`,
    category: "Servicios",
    icon: Briefcase,
    highlight: true,
  },
  {
    question: "¿Cómo validan a los candidatos?",
    answer: `**Proceso riguroso de validación:**

- **Scorecards personalizados** según tu ICP
- **Entrevistas estructuradas** con criterios objetivos
- **Pruebas técnicas opcionales** adaptadas al rol
- **Chequeo de referencias** con empleadores previos
- **Evaluación cultural** para fit con tu equipo

**Garantía:** solo presentamos talento pre-validado.`,
    category: "Proceso",
    icon: FileCheck,
    popular: true,
  },
  {
    question: "¿Trabajan con nuestro ATS actual?",
    answer: `**Integración flexible:**

- **Compatibilidad** con los principales ATS del mercado
- **Tableros compartidos** en Notion, Airtable o Google Sheets
- **Reportes en tiempo real** del pipeline
- **Sincronización automática** de candidatos

**Adaptación:** trabajamos con tu stack actual.`,
    category: "Tecnología",
    icon: Zap,
  },
  {
    question: "¿Cuánto tiempo toma ver los primeros candidatos?",
    answer: `**Pipeline acelerado:**

- **48-72 horas** después del kick-off
- **Prospección activa inmediata** en múltiples canales
- **Automatizaciones** para acelerar el sourcing
- **Validación rápida** sin sacrificar calidad

**Velocidad:** primeros perfiles en menos de 3 días.`,
    category: "Tiempo",
    icon: Clock,
    highlight: true,
  },
  {
    question: "¿Qué incluye el diagnóstico gratuito?",
    answer: `**Análisis completo sin costo:**

- **Auditoría de tu proceso actual** de contratación
- **Definición del ICP** (Ideal Candidate Profile)
- **Scorecard del rol** con criterios objetivos
- **Plan de acción** para las próximas 2 semanas
- **Estimación de timeline** y recursos necesarios

**Valor:** insights accionables desde el día 1.`,
    category: "Diagnóstico",
    icon: Target,
  },
]

const categories = ["Todos", "Garantía", "Servicios", "Proceso", "Tecnología", "Tiempo", "Diagnóstico"]

function Chips({
  selected,
  onSelect,
  compact = false,
}: { selected: string; onSelect: (c: string) => void; compact?: boolean }) {
  return (
    <div className={`${compact ? "px-4" : "flex-wrap justify-center"} flex gap-2`}>
      {compact ? (
        <div className="w-full space-y-2">
          <div className="grid grid-cols-4 gap-2">
            {categories.slice(0, 4).map((c) => {
              const active = selected === c
              return (
                <button
                  key={c}
                  onClick={() => onSelect(c)}
                  className={[
                    "antialiased whitespace-nowrap rounded-full border text-xs font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground border-transparent shadow-md"
                      : "bg-card text-foreground/70 border-border hover:shadow-md",
                    "px-3 py-1.5",
                  ].join(" ")}
                >
                  {c}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {categories.slice(4).map((c) => {
              const active = selected === c
              return (
                <button
                  key={c}
                  onClick={() => onSelect(c)}
                  className={[
                    "antialiased whitespace-nowrap rounded-full border text-xs font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground border-transparent shadow-md"
                      : "bg-card text-foreground/70 border-border hover:shadow-md",
                    "px-3 py-1.5",
                  ].join(" ")}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        categories.map((c) => {
          const active = selected === c
          return (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className={[
                "antialiased whitespace-nowrap rounded-full border text-sm font-semibold transition-all",
                active
                  ? "bg-primary text-primary-foreground border-transparent shadow-md"
                  : "bg-card text-foreground/70 border-border hover:shadow-md",
                "px-4 py-2",
              ].join(" ")}
            >
              {c}
            </button>
          )
        })
      )}
    </div>
  )
}

export function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth < 768)
    f()
    window.addEventListener("resize", f)
    return () => window.removeEventListener("resize", f)
  }, [])

  const filteredFaqs = selectedCategory === "Todos" ? faqs : faqs.filter((faq) => faq.category === selectedCategory)

  return (
    <section id="faq" className="relative bg-background py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20 transform-gpu">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-balance text-foreground">
            Preguntas <span className="text-primary">Frecuentes</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas saber sobre contratación rápida y talento validado.
          </p>
        </motion.div>

        <div className="mb-8 sm:mb-10">
          <Chips selected={selectedCategory} onSelect={setSelectedCategory} compact={isMobile} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group relative rounded-[2.5rem] border border-border bg-card shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-accent-blue/10 opacity-30 group-hover:opacity-50 transition-opacity duration-300" />

                <AccordionTrigger className="relative z-10 text-left px-6 py-6 sm:px-8 sm:py-7 hover:no-underline [&[data-state=open]>div>div:last-child>svg]:rotate-90">
                  <div className="flex items-center gap-3 sm:gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight tracking-tight">
                        {faq.question}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold mt-1">{faq.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary transition-transform duration-300 stroke-2" />
                  </div>
                </AccordionTrigger>

                <AccordionContent className="relative z-10 px-6 pb-6 sm:px-8 sm:pb-8">
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown
                      components={{
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-1 marker:text-primary">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                        p: ({ children }) => (
                          <p className="mb-3 last:mb-0 leading-relaxed text-sm sm:text-base text-muted-foreground">
                            {children}
                          </p>
                        ),
                      }}
                    >
                      {faq.answer}
                    </ReactMarkdown>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
