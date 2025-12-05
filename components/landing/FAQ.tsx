'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: '¿Qué es Agente WhatsApp?',
    a: 'Es una plataforma de automatización que usa inteligencia artificial para responder automáticamente los mensajes de WhatsApp de tu negocio, calificar leads y mantener conversaciones naturales las 24 horas del día.'
  },
  {
    q: '¿Cómo funciona la IA?',
    a: 'Nuestra IA está entrenada para entender contexto, mantener conversaciones naturales y responder como lo haría un vendedor experto. Podés personalizar el tono, estilo y tipo de respuestas según tu marca.'
  },
  {
    q: '¿Necesito conocimientos técnicos?',
    a: 'No, para nada. Solo necesitás escanear un código QR con tu WhatsApp y configurar algunas opciones básicas. Todo el proceso toma menos de 5 minutos.'
  },
  {
    q: '¿Funciona con WhatsApp Business?',
    a: 'Sí, funciona tanto con WhatsApp normal como con WhatsApp Business. No necesitás ninguna app adicional ni cambiar tu número.'
  },
  {
    q: '¿Puedo ver las conversaciones?',
    a: 'Sí, tenés acceso completo a todas las conversaciones desde el dashboard. Podés intervenir manualmente cuando quieras y ver métricas detalladas de cada interacción.'
  },
  {
    q: '¿Qué pasa si quiero cancelar?',
    a: 'Podés cancelar cuando quieras sin ningún problema. No hay contratos de permanencia ni costos ocultos. Tu cuenta se desactiva al finalizar el período pagado.'
  },
  {
    q: '¿Ofrecen soporte en español?',
    a: 'Sí, todo nuestro soporte es en español. Tenés acceso a chat en vivo, email y una base de conocimientos completa para resolver cualquier duda.'
  },
];

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Floating orbs */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Preguntas{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              frecuentes
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Todo lo que necesitás saber sobre Agente WhatsApp
          </p>
        </motion.div>

        {/* FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <div className={`rounded-2xl bg-gray-900/50 backdrop-blur-sm border transition-all duration-300 overflow-hidden ${
                openFaq === idx
                  ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'border-gray-800/50 hover:border-gray-700/50'
              }`}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 flex justify-between items-center text-left"
                >
                  <span className={`font-semibold text-lg transition-colors ${
                    openFaq === idx ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'
                  }`}>
                    {faq.q}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    openFaq === idx
                      ? 'bg-emerald-500/20 rotate-180'
                      : 'bg-gray-800/50 group-hover:bg-emerald-500/10'
                  }`}>
                    <ChevronDown className={`w-5 h-5 transition-colors ${
                      openFaq === idx ? 'text-emerald-400' : 'text-gray-400'
                    }`} />
                  </div>
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-gray-800/50 pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 mb-4">¿Tenés otra pregunta?</p>
          <a
            href="https://wa.me/5492364655702?text=Hola!%20Tengo%20una%20pregunta%20sobre%20Agente%20WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900/50 border border-gray-800/50 text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300"
          >
            <span>Escribinos por WhatsApp</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
