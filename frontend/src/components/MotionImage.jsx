import { motion } from 'framer-motion';

export default function MotionImage({ src, alt, className = '', hoverScale = 1.05 }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      whileHover={{ scale: hoverScale }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    />
  );
}
