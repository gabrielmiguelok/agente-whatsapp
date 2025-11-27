import { Clock, Timer, TrendingUp, TrendingDown } from "lucide-react"

export function Metrics() {
  const metrics = [
    {
      icon: Clock,
      value: "72",
      unit: "HORAS",
      label: "Primera selección de candidatos validados",
    },
    {
      icon: Timer,
      value: "15",
      unit: "DÍAS",
      label: "Tiempo promedio de contratación",
    },
    {
      icon: TrendingUp,
      value: "+45",
      unit: "%",
      label: "Más rápido que procesos tradicionales",
    },
    {
      icon: TrendingDown,
      value: "-36",
      unit: "%",
      label: "Menos rotación en primeros 6 meses",
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-accent/5 via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-balance text-foreground">LOS RESULTADOS QUE IMPORTAN</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card backdrop-blur-sm p-8 text-center space-y-4 premium-shadow hover:premium-shadow-lg transition-all group"
              >
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-primary">{metric.value}</div>
                  <div className="text-sm font-semibold text-foreground">{metric.unit}</div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
