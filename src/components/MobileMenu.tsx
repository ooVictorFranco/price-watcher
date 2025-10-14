// src/components/MobileMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
        aria-label="Menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-gray-900 rounded-full origin-center"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-full h-0.5 bg-gray-900 rounded-full"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-gray-900 rounded-full origin-center"
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - MUST cover entire viewport */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed bg-black/40 backdrop-blur-md z-[250]"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                position: 'fixed',
                width: '100vw',
                height: '100vh'
              }}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bg-white/95 backdrop-blur-xl shadow-2xl z-[300] overflow-y-auto"
              style={{
                top: 0,
                right: 0,
                bottom: 0,
                position: 'fixed',
                width: '288px',
                height: '100vh'
              }}
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <h2 className="font-semibold text-lg">Menu</h2>
                  <button
                    onClick={closeMenu}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Fechar menu"
                  >
                    ✕
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">🔍</span>
                    <span className="font-medium">Monitorar Preços</span>
                  </Link>
                  <Link
                    href="/favoritos"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">⭐</span>
                    <span className="font-medium">Favoritos</span>
                  </Link>
                  <Link
                    href="/changelog"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">📝</span>
                    <span className="font-medium">Histórico de Atualizações</span>
                  </Link>
                  <Link
                    href="/privacidade"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">🔒</span>
                    <span className="font-medium">Privacidade</span>
                  </Link>
                </nav>

                {/* Footer Links */}
                <div className="pt-6 border-t space-y-2">
                  <a
                    href="https://github.com/ooVictorFranco/price-watcher"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span>📦</span>
                    <span>Código Fonte</span>
                  </a>
                  <a
                    href="https://github.com/ooVictorFranco/price-watcher/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span>💬</span>
                    <span>Reportar Bug</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
