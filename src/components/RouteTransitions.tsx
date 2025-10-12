// src/components/RouteTransitions.tsx
'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function RouteTransitions({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  const variants = {
    initial: { opacity: 0, y: prefersReduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: prefersReduced ? 0 : -8 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
