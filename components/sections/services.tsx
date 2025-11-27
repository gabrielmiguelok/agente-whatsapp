import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Target, Briefcase, Star } from "lucide-react"

export function Services() {
  const services = [
    {
      icon: Target,
      name: "Reclutamiento Express",
      description: "Encontramos, validamos y te presentamos el talento que necesitás. En tiempo récord.",
      features: [
        "Búsqueda activa en LinkedIn",
        "Validación de experiencia y referencias",
        "Primera selección en 72h",
        "Acompañamiento hasta contratación",
      ],
      highlighted: true,
      badge: "Más Popular",
    },
    {
      icon: Briefcase,
      name: "Consultoría de Talento y Ventas",
      description: "Resolvemos tus desafíos de talento y ventas a largo plazo.",
      features: [
        "Estrategia de atracción de talento",
        "Optimización de ventas con LinkedIn",
        "Employer branding",
        "Crecimiento comercial B2B",
      ],
      highlighted: false,
    },
    {
      icon: Star,
      name: "Acompañamiento para Profesionales",
      description: "Te posicionamos como autoridad en LinkedIn para atraer oportunidades.",
      features: [
        "Marca personal estratégica",
        "Optimización perfil LinkedIn",
        "Estrategia de contenido",
        "Orientación búsqueda empleo",
      ],
      highlighted: false,
    },
  ]

  return (
    <section id="servicios" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-balance">NUESTROS SERVICIOS</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Elegí el nivel de acompañamiento que mejor encaje con tus necesidades.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className={`rounded-2xl border p-8 space-y-6 premium-shadow hover:premium-shadow-lg transition-all ${
                  service.highlighted ? "border-accent bg-accent/5 scale-105" : "border-border bg-card"
                }`}
              >
                {service.badge && <Badge className="bg-accent text-accent-foreground">{service.badge}</Badge>}

                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>

                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
