'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-10 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
              Agente WhatsApp
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#pricing"
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Precios
            </a>
            <a
              href="#"
              className={`text-sm font-medium transition-colors ${
                isScrolled
                  ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Iniciar sesión
            </a>
            <a
              href="#"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
            >
              Empezar gratis
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} />
            ) : (
              <Menu className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-4">
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Precios
              </a>
              <a
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Iniciar sesión
              </a>
              <a
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center font-semibold"
              >
                Empezar gratis
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
