'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  Zap,
  Clock,
  MessageSquare,
  Users,
  BarChart3,
  Sparkles,
  BrainCircuit,
  Target
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'IA Conversacional',
    description: 'Respuestas inteligentes que entienden contexto y mantienen conversaciones naturales',
    color: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/25',
  },
  {
    icon: Zap,
    title: 'Respuesta Instantánea',
    description: 'Contestá en segundos, las 24 horas del día, sin perder ningún cliente',
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/25',
  },
  {
    icon: BrainCircuit,
    title: 'Aprendizaje Continuo',
    description: 'La IA aprende de cada conversación y mejora sus respuestas automáticamente',
    color: 'from-cyan-500 to-blue-600',
    shadowColor: 'shadow-cyan-500/25',
  },
  {
    icon: Target,
    title: 'Calificación de Leads',
    description: 'Identifica automáticamente los prospectos más calientes para priorizar',
    color: 'from-emerald-500 to-green-600',
    shadowColor: 'shadow-emerald-500/25',
  },
  {
    icon: MessageSquare,
    title: 'Secuencias Automáticas',
    description: 'Follow-ups programados que mantienen el interés sin ser invasivos',
    color: 'from-pink-500 to-rose-600',
    shadowColor: 'shadow-pink-500/25',
  },
  {
    icon: BarChart3,
    title: 'Analytics en Tiempo Real',
    description: 'Métricas detalladas de conversiones, respuestas y engagement',
    color: 'from-sky-500 to-indigo-600',
    shadowColor: 'shadow-sky-500/25',
  },
];

export default function Features() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)]" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px]"
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]"
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
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
            <Sparkles className="w-4 h-4" />
            <span>Funcionalidades</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Todo lo que necesitás para{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              vender más
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Automatizá tu WhatsApp con inteligencia artificial y convertí cada mensaje en una oportunidad de venta
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-3xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} ${feature.shadowColor} shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-bl-[100px] rounded-tr-3xl transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* WhatsApp Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mt-16"
        >
          <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 shadow-xl shadow-emerald-500/30 border border-emerald-400/30">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <strong className="block text-lg font-bold text-white">✅ 100% integrado con WhatsApp</strong>
              <span className="text-sm font-medium text-white/90">Sin apps adicionales, funciona directo desde tu número</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
