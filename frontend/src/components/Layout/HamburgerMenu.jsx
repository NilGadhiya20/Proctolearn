import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const HamburgerMenu = ({ 
  isOpen, 
  onToggle, 
  placement = 'top-left', 
  size = 'md',
  variant = 'default',
  className = '',
  showLabel = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const variants = {
    default: 'bg-white hover:bg-slate-50 border-slate-200 text-black hover:text-slate-900',
    primary: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white',
    ghost: 'bg-transparent hover:bg-slate-100 border-transparent text-black hover:text-slate-900',
    outline: 'bg-transparent hover:bg-slate-50 border-slate-300 text-black hover:text-slate-900'
  };

  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  };

  const iconVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 }
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileTap="tap"
      whileHover="hover"
      onClick={onToggle}
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]}
        ${variants[variant]}
        border shadow-sm rounded-xl
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        active:shadow-sm z-[100]
        ${className}
      `}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <motion.div
        variants={iconVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <X size={iconSizes[size]} className="transition-colors duration-200" />
        ) : (
          <Menu size={iconSizes[size]} className="transition-colors duration-200" />
        )}
      </motion.div>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: isOpen ? 1.2 : 0, opacity: isOpen ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: variant === 'primary' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(16, 185, 129, 0.3)',
        }}
      />
      
      {showLabel && (
        <span className={`ml-2 font-medium text-sm ${
          variant === 'primary' || variant === 'ghost' ? '' : 'text-slate-700'
        }`}>
          {isOpen ? 'Close' : 'Menu'}
        </span>
      )}
    </motion.button>
  );
};

export default HamburgerMenu;