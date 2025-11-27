"use client"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, ArrowRight } from "lucide-react"
import { useState } from "react"

const MAP_VERTICAL_OFFSET = 0 // Increase to move map down, decrease to move up
const MOBILE_EMPRESA_OFFSET = 100 // Increase to move Empresa section more to the right in mobile

const locations = [
  {
    name: "Argentina",
    flag: "🇦🇷",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14251781.098623833!2d-68.83583309999999!3d-38.416097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaf5f5fdc667%3A0x3d2f77992af00fa8!2sArgentina!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar",
  },
  {
    name: "España",
    flag: "🇪🇸",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6458662.546855033!2d-8.664063999999999!3d40.463667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc42e3783261bc8b%3A0xa6ec2c940768a3ec!2sEspa%C3%B1a!5e0!3m2!1ses!2ses!4v1234567890123!5m2!1ses!2ses",
  },
  {
    name: "LATAM",
    flag: "🌎",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63825894.67374949!2d-96.09326171875!3d-8.783195401412246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9409e1d5e5b5e5e5%3A0x5e5e5e5e5e5e5e5e!2sAm%C3%A9rica%20Latina!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar",
  },
]

export function Footer() {
  const [activeLocation, setActiveLocation] = useState(locations[0])

  const MapSelectorCard = () => (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-[2.5rem] p-4 sm:p-5 shadow-xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
          Nuestras Ubicaciones
        </h3>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          {locations.map((location) => (
            <button
              key={location.name}
              onClick={() => setActiveLocation(location)}
              className={`px-3 py-1.5 text-sm font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                activeLocation.name === location.name
                  ? "bg-muted text-foreground shadow-md"
                  : "bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {location.flag} {location.name}
            </button>
          ))}
        </div>
      </div>
      <div className="relative rounded-2xl overflow-hidden h-[280px] sm:h-[320px] w-full">
        <iframe
          key={activeLocation.name}
          src={activeLocation.mapEmbedUrl}
          className="absolute top-0 left-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Ubicación en ${activeLocation.name}`}
        />
      </div>
    </div>
  )

  return (
    <footer className="relative border-t border-border overflow-hidden">
      <div className="container relative mx-auto px-4 py-12 lg:py-16 max-w-7xl">
        <div className="md:hidden space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/logo-header.png"
                alt="Allá Vamos Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
                priority
              />
              <Image src="/alla-vamos.png" alt="Allá Vamos" width={120} height={40} className="h-10 w-auto" priority />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Talento validado en tiempo récord para empresas que crecen rápido. Pipeline en 72h, garantía de 15 días y
              acompañamiento end-to-end.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8"
          >
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Servicios</h3>
              <ul className="space-y-2">
                {[
                  { href: "#servicios", label: "Reclutamiento Express" },
                  { href: "#servicios", label: "Consultoría de Talento" },
                  { href: "#servicios", label: "Acompañamiento" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginLeft: `${MOBILE_EMPRESA_OFFSET}px` }}>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Empresa</h3>
              <ul className="space-y-2">
                {[
                  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
                  { href: "#proceso", label: "Nuestro Proceso" },
                  { href: "#faq", label: "FAQ" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <MapSelectorCard />
          </motion.div>
        </div>

        <div className="hidden md:grid lg:hidden md:grid-cols-12 md:gap-6">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-5 space-y-6"
          >
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-header.png"
                  alt="Allá Vamos Logo"
                  width={52}
                  height={52}
                  className="h-13 w-auto"
                  priority
                />
                <Image
                  src="/alla-vamos.png"
                  alt="Allá Vamos"
                  width={130}
                  height={44}
                  className="h-11 w-auto"
                  priority
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Talento validado en tiempo récord para empresas que crecen rápido. Pipeline en 72h, garantía de 15 días
                y acompañamiento end-to-end.
              </p>
            </div>

            {/* Services Section */}
            <div>
              <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Servicios</h3>
              <ul className="space-y-2">
                {[
                  { href: "#servicios", label: "Reclutamiento Express" },
                  { href: "#servicios", label: "Consultoría de Talento" },
                  { href: "#servicios", label: "Acompañamiento Profesional" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Empresa</h3>
              <ul className="space-y-2">
                {[
                  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
                  { href: "#proceso", label: "Nuestro Proceso" },
                  { href: "#faq", label: "FAQ" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-accent" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Column - Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="col-span-7"
            style={{ marginTop: `${MAP_VERTICAL_OFFSET}px` }}
          >
            <MapSelectorCard />
          </motion.div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-5 space-y-8"
          >
            {/* Logo and Description */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-header.png"
                  alt="Allá Vamos Logo"
                  width={56}
                  height={56}
                  className="h-14 w-auto"
                  priority
                />
                <Image
                  src="/alla-vamos.png"
                  alt="Allá Vamos"
                  width={140}
                  height={48}
                  className="h-12 w-auto"
                  priority
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Talento validado en tiempo récord para empresas que crecen rápido. Pipeline en 72h, garantía de 15 días
                y acompañamiento end-to-end.
              </p>
            </div>

            {/* Services Section */}
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Servicios</h3>
              <ul className="space-y-2.5">
                {[
                  { href: "#servicios", label: "Reclutamiento Express" },
                  { href: "#servicios", label: "Consultoría de Talento" },
                  { href: "#servicios", label: "Acompañamiento Profesional" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Empresa</h3>
              <ul className="space-y-2.5">
                {[
                  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
                  { href: "#proceso", label: "Nuestro Proceso" },
                  { href: "#faq", label: "FAQ" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-accent" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right Column - Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="col-span-7"
            style={{ marginTop: `${MAP_VERTICAL_OFFSET}px` }}
          >
            <MapSelectorCard />
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 mt-8 border-t border-border"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Allá Vamos. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
