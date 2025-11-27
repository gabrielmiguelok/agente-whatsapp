// components/home/Hero.tsx
'use client';

export default function Hero() {
  return (
    <section className="relative">
      {/* Header minimalista con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Tableros
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-100 max-w-2xl px-2">
              Componente CustomTable para React y Next.js con 13 tipos de columnas, edición inline y filtros avanzados
            </p>

            {/* Características compactas */}
            <div className="flex flex-wrap justify-center gap-2 text-white/90 text-xs">
              <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">🔍 Búsqueda</span>
              <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">✏️ Edición</span>
              <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">📊 Export</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
