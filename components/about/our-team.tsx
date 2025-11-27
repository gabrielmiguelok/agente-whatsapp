"use client"

import { motion } from "framer-motion"
import { Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

const team = [
  {
    name: "María González",
    role: "CEO & Fundadora",
    image: "/professional-woman-ceo-smiling.jpg",
    linkedin: "#",
  },
  {
    name: "Carlos Rodríguez",
    role: "CTO",
    image: "/professional-man-cto-technology.jpg",
    linkedin: "#",
  },
  {
    name: "Ana Martínez",
    role: "Head of Talent",
    image: "/professional-woman-hr-talent.jpg",
    linkedin: "#",
  },
  {
    name: "Diego Fernández",
    role: "Lead AI Engineer",
    image: "/professional-man-engineer-ai.jpg",
    linkedin: "#",
  },
]

export function OurTeam() {
  return (
    <section className="bg-gradient-to-br from-background via-accent/5 to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Nuestro equipo</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Profesionales apasionados por conectar talento con oportunidades excepcionales.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg transition-all hover:shadow-xl"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={`${member.name}, ${member.role} de AlaTalento`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  width="400"
                  height="400"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-1 text-xl font-bold text-foreground">{member.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{member.role}</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver perfil de LinkedIn de ${member.name}`}
                  >
                    <Linkedin className="mr-2 h-4 w-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
