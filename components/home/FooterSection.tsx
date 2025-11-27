// components/home/FooterSection.tsx
'use client';

export default function FooterSection() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 sm:py-12 mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Sobre el proyecto */}
          <div>
            <h3 className="text-xl font-bold mb-3">Tableros</h3>
            <p className="text-slate-400 text-sm mb-4">
              CustomTable es un componente de tabla potente y personalizable para React y Next.js.
              Con 13 tipos de columnas, edición inline, filtros avanzados y exportación a Excel.
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">React 19</span>
              <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">Next.js 15</span>
              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">TypeScript</span>
            </div>
          </div>

          {/* Características */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Características</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 13 tipos de columnas diferentes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Edición en línea con navegación por teclado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Filtros avanzados y búsqueda global
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Tema claro/oscuro automático
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Exportación a Excel
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Badges con colores automáticos (estilo Notion)
              </li>
            </ul>
          </div>

          {/* Tecnologías */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tecnologías</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-blue-400">→</span> React 19 + Next.js 15
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">→</span> TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">→</span> TanStack Table v8
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">→</span> Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">→</span> SheetJS (xlsx) para exportar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">→</span> Sistema de colores hash-based
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Tableros • CustomTable Component •{' '}
            <a
              href="https://github.com"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Componente de tabla avanzado para React y Next.js • MIT License
          </p>
        </div>
      </div>
    </footer>
  );
}
