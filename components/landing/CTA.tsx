'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, MessageCircle, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800" />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-white/10 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Empezá en menos de 5 minutos</span>
          </motion.div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Automatizá tu WhatsApp{' '}
            <span className="text-amber-300">hoy mismo</span>
          </h2>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Dejá de perder clientes por no responder a tiempo. Empezá tu prueba gratuita de 14 días sin tarjeta de crédito.
          </p>

          {/* Features mini */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {[
              '14 días gratis',
              'Sin tarjeta de crédito',
              'Cancelás cuando quieras',
            ].map((feature, idx) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 text-white/90"
              >
                <CheckCircle className="w-5 h-5 text-amber-300" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-emerald-700 text-lg font-bold shadow-2xl shadow-black/20 hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6" />
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Guarantee Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-white mb-1">Garantía sin riesgos</h3>
                <p className="text-white/80">
                  Probá gratis por 14 días. Si no te convence, cancelás sin ningún compromiso.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
