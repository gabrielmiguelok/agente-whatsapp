'use client';

import { motion } from 'framer-motion';
import { Zap, QrCode, MessageSquare, Rocket, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Conectás',
    description: 'Escaneás el QR con tu WhatsApp en 30 segundos',
    icon: QrCode,
    color: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/30',
  },
  {
    number: '02',
    title: 'Configurás',
    description: 'Personalizás la IA con el tono y estilo de tu marca',
    icon: MessageSquare,
    color: 'from-cyan-500 to-blue-600',
    shadowColor: 'shadow-cyan-500/30',
  },
  {
    number: '03',
    title: 'Automatizás',
    description: 'Definís secuencias y respuestas inteligentes',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/30',
  },
  {
    number: '04',
    title: 'Vendés',
    description: 'La IA califica leads mientras vos cerrás ventas',
    icon: Rocket,
    color: 'from-emerald-500 to-green-600',
    shadowColor: 'shadow-emerald-500/30',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-gray-900" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Proceso simple</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Cómo{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              funciona
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            En menos de 5 minutos tenés tu WhatsApp automatizado y listo para vender
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/40 to-emerald-500/20 -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative group"
              >
                {/* Card */}
                <div className="relative h-full p-8 rounded-3xl bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2">
                  {/* Big number background */}
                  <span className="absolute top-4 right-4 text-[100px] font-black leading-none bg-gradient-to-br from-gray-800/50 to-transparent bg-clip-text text-transparent select-none">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} ${step.shadowColor} shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="relative z-10 text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="relative z-10 text-gray-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Hover gradient */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </div>

                {/* Arrow connector - mobile/tablet */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight className="w-6 h-6 text-emerald-500/50 rotate-90 sm:rotate-0" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-bold shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
          >
            Empezar ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
