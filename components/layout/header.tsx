"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import Link from "next/link"
import { Mail, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

const navItems = [
  { name: "Proceso", href: "/#metodologia" },
  { name: "Servicios", href: "/#servicios" },
  { name: "FAQ", href: "/#faq" },
  { name: "Sobre Nosotros", href: "/sobre-nosotros" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "py-3" : "py-6"}`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div
          className={`mx-auto transition-all duration-500 ${
            isScrolled
              ? "max-w-7xl bg-background/95 backdrop-blur-xl border border-border rounded-full shadow-lg px-4 sm:px-6 py-3"
              : "max-w-7xl bg-transparent px-4 sm:px-6 py-3"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14">
                <Image
                  src="/logo-header.png"
                  alt="Allá Vamos Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 48px, 56px"
                  quality={100}
                  priority
                />
              </div>
              <div className="relative h-8 w-24 sm:h-10 sm:w-32">
                <Image
                  src="/alla-vamos.png"
                  alt="Allá Vamos"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 96px, 128px"
                  quality={100}
                  priority
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 rounded-full text-sm font-bold transition text-foreground hover:bg-primary/5 hover:shadow-sm antialiased"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-sm antialiased text-sm font-bold"
              >
                <a href="mailto:contacto@allavamos.com" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Hablemos</span>
                </a>
              </Button>

              <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="default"
                      className="p-3 rounded-full hover:bg-accent/10 border-2 border-border/50"
                    >
                      <Menu className="h-6 w-6 text-foreground" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 bg-background/98 backdrop-blur-md border-l border-border">
                    <div className="flex flex-col space-y-6 mt-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center gap-3 mb-3">
                          <div className="relative h-16 w-16">
                            <Image
                              src="/logo-header.png"
                              alt="Allá Vamos Logo"
                              fill
                              className="object-contain"
                              quality={100}
                              sizes="64px"
                            />
                          </div>
                          <div className="relative h-12 w-32">
                            <Image
                              src="/alla-vamos.png"
                              alt="Allá Vamos"
                              fill
                              className="object-contain"
                              quality={100}
                              sizes="128px"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground antialiased mt-1 font-bold">
                          Reclutamiento Express
                        </p>
                      </div>

                      <nav className="flex flex-col space-y-1 px-4">
                        {navItems.map((item) => (
                          <SheetClose asChild key={item.name}>
                            <Link
                              href={item.href}
                              onTouchStart={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)"
                                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                              }}
                              onTouchEnd={(e) => {
                                e.currentTarget.style.transform = ""
                                e.currentTarget.style.boxShadow = ""
                              }}
                              className="px-4 py-3 rounded-2xl text-base font-bold transition-all text-foreground hover:bg-primary/5 hover:shadow-sm text-center antialiased"
                            >
                              {item.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </nav>

                      <div className="flex flex-col space-y-3 pt-4 border-t border-border px-4">
                        <Button
                          asChild
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full antialiased text-base font-bold"
                        >
                          <a href="mailto:contacto@allavamos.com">
                            <Mail className="w-4 h-4 mr-2" /> Contacto
                          </a>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
