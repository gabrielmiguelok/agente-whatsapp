import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Phone } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section
      id="contacto"
      className="py-20 md:py-32 bg-gradient-to-br from-foreground via-foreground to-accent/20 text-background"
    >
      <div className="container mx-auto px-4 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-balance">¿ARRANCAMOS?</h2>
          <p className="text-xl text-background/80 font-semibold">
            Tu próximo gran colaborador está a una conversación de distancia.
          </p>
          <p className="text-lg text-background/70">
            Agendá una llamada de 20 minutos. Sin compromiso. Sin formularios eternos.
          </p>
        </div>

        <Button size="lg" variant="secondary" asChild className="group">
          <Link
            href="https://wa.me/+5491234567890?text=Hola, quiero hablar sobre reclutamiento para mi empresa"
            target="_blank"
          >
            Hablemos ahora
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
          <div className="flex items-center gap-2 text-background/80">
            <Mail className="h-5 w-5" />
            <a href="mailto:contacto@allavamos.com" className="hover:text-background transition-colors">
              contacto@allavamos.com
            </a>
          </div>
          <div className="flex items-center gap-2 text-background/80">
            <Phone className="h-5 w-5" />
            <span>Argentina, España y LATAM</span>
          </div>
        </div>
      </div>
    </section>
  )
}
