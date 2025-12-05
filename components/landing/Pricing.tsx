'use client';

import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Rocket, ArrowRight, Sparkles, Shield } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Rocket,
    originalPrice: 49,
    price: 29,
    period: '/mes',
    discount: '40% OFF',
    description: 'Para emprendedores y pequeños negocios',
    features: [
      { text: '1 número de WhatsApp', included: true },
      { text: '500 conversaciones/mes', included: true },
      { text: 'Respuestas con IA', included: true },
      { text: 'Dashboard básico', included: true },
      { text: 'Soporte por email', included: true },
      { text: 'Secuencias automáticas', included: false },
      { text: 'Calificación de leads', included: false },
    ],
    cta: 'Empezar gratis',
    href: '/login',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-600',
    shadowColor: 'shadow-sky-500/25',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Crown,
    originalPrice: 149,
    price: 79,
    period: '/mes',
    discount: '47% OFF',
    description: 'Para negocios en crecimiento',
    features: [
      { text: '3 números de WhatsApp', included: true },
      { text: 'Conversaciones ilimitadas', included: true },
      { text: 'IA personalizable', included: true },
      { text: 'Secuencias automáticas', included: true },
      { text: 'Calificación de leads', included: true },
      { text: 'Analytics avanzados', included: true },
      { text: 'Soporte prioritario 24/7', included: true },
    ],
    cta: 'Elegir Pro',
    href: '/login',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    shadowColor: 'shadow-emerald-500/30',
    popular: true,
  },
];

const comparisonOthers = [
  { title: 'Respuestas manuales', desc: 'Perdés clientes mientras dormís' },
  { title: 'Sin personalización', desc: 'Respuestas genéricas y frías' },
  { title: 'Precios de +$200/mes', desc: 'Herramientas caras y complejas' },
];

const comparisonUs = [
  { title: 'IA 24/7 automática', desc: 'Nunca perdés un cliente', highlight: true },
  { title: 'Respuestas naturales', desc: 'Tu tono, tu estilo de marca' },
  { title: 'Desde $29/mes', desc: '47% OFF por tiempo limitado' },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[100px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
            <span>Hasta 47% de descuento</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Planes simples y{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              transparentes
            </span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Elegí el plan que mejor se adapte a tu negocio. Todos incluyen 14 días de prueba gratis.
          </p>
        </motion.div>

        {/* Comparison section */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Others */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-red-500/5 border border-red-500/20 p-8"
          >
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-red-500/10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Sin automatización</h3>
                <span className="text-sm text-gray-500">Lo que hacen la mayoría</span>
              </div>
            </div>
            <ul className="space-y-4">
              {comparisonOthers.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✕</span>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Us */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-emerald-500/5 border border-emerald-500/30 p-8"
          >
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-emerald-500/10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Agente WhatsApp</h3>
                <span className="text-sm text-gray-500">Todo esto desde $29/mes</span>
              </div>
            </div>
            <ul className="space-y-4">
              {comparisonUs.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                    item.highlight
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}>✓</span>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative group"
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                    ⭐ Más popular
                  </span>
                </div>
              )}

              {/* Card */}
              <div className={`relative h-full p-8 rounded-3xl bg-gray-900/50 backdrop-blur-sm border-2 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/20'
                  : 'border-gray-800/50 hover:border-sky-500/30'
              }`}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} ${plan.shadowColor} shadow-lg flex items-center justify-center`}>
                    <plan.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl text-gray-500 line-through">${plan.originalPrice}</span>
                    <span className="text-5xl font-black text-white">${plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                    plan.popular
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-sky-500/10 text-sky-400'
                  }`}>
                    🔥 {plan.discount}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-emerald-500' : 'text-sky-500'}`} />
                      ) : (
                        <X className="w-5 h-5 flex-shrink-0 text-gray-600" />
                      )}
                      <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.href}>
                  <button className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-900/50 border border-gray-800/50">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-gray-400 text-sm">
              14 días de prueba gratis · Sin tarjeta · Cancelás cuando quieras
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
