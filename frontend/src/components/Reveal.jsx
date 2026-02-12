import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Reveal({ children, delay = 0, className = '', direction = 'up', once = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const variants = {
    up: { opacity: 0, y: 50 },
    down: { opacity: 0, y: -50 },
    left: { opacity: 0, x: 50 },
    right: { opacity: 0, x: -50 },
    scale: { opacity: 0, scale: 0.8 },
    none: { opacity: 0 }
  };

  return (
    <motion.div
      ref={ref}
      initial={variants[direction] || variants.up}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : variants[direction] || variants.up}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
