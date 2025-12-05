'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    text: 'Increíble cómo la IA entiende exactamente lo que mis clientes preguntan. Mis ventas aumentaron un 40% el primer mes.',
    name: 'Martín Rodríguez',
    position: 'CEO',
    company: 'Digital Commerce',
    avatar: 'MR',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    text: 'Antes perdía clientes por no responder rápido. Ahora respondo 24/7 automáticamente y mi tasa de conversión se triplicó.',
    name: 'Carolina Méndez',
    position: 'Fundadora',
    company: 'CM Marketing',
    avatar: 'CM',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    text: 'La calificación automática de leads me ahorra horas por día. Solo me enfoco en los prospectos que realmente van a comprar.',
    name: 'Lucas Fernández',
    position: 'Director Comercial',
    company: 'Inmobiliaria LF',
    avatar: 'LF',
    gradient: 'from-cyan-500 to-blue-600',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[100px]"
        animate={{ x: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4" />
            <span>Testimonios</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Lo que dicen nuestros{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              clientes
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Empresas que ya transformaron sus ventas con Agente WhatsApp
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-3xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-emerald-500/30 transition-all duration-300">
                {/* Quote icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="w-10 h-10 text-emerald-500/20 rotate-180" />
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 leading-relaxed mb-8 text-lg italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-800/50">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">
                      {testimonial.position}, {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Hover gradient */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '500+', label: 'Empresas activas' },
            { value: '1M+', label: 'Mensajes enviados' },
            { value: '40%', label: 'Más conversiones' },
            { value: '24/7', label: 'Disponibilidad' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
