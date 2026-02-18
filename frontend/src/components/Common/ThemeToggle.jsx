import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../../context/themeContext';

const ThemeToggle = ({ variant = 'default', size = 'md', showLabel = false, className = '' }) => {
  const { isDark, toggleTheme } = useThemeContext();

  // Size configurations
  const sizes = {
    sm: {
      container: 'w-12 h-6',
      toggle: 'w-5 h-5',
      translate: 'translate-x-6',
      icon: 14,
    },
    md: {
      container: 'w-14 h-7',
      toggle: 'w-6 h-6',
      translate: 'translate-x-7',
      icon: 16,
    },
    lg: {
      container: 'w-16 h-8',
      toggle: 'w-7 h-7',
      translate: 'translate-x-8',
      icon: 18,
    },
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Variant styles
  const variants = {
    default: {
      container: 'bg-slate-200 dark:bg-slate-700',
      toggle: 'bg-white dark:bg-slate-300',
      iconLight: 'text-amber-500',
      iconDark: 'text-indigo-600',
    },
    gradient: {
      container: 'bg-gradient-to-r from-amber-200 to-orange-300 dark:from-indigo-900 dark:to-purple-900',
      toggle: 'bg-white dark:bg-slate-800 shadow-lg',
      iconLight: 'text-amber-500',
      iconDark: 'text-indigo-400',
    },
    outline: {
      container: 'bg-transparent border-2 border-slate-300 dark:border-slate-600',
      toggle: 'bg-slate-700 dark:bg-white',
      iconLight: 'text-amber-500',
      iconDark: 'text-indigo-400',
    },
    minimal: {
      container: 'bg-slate-100 dark:bg-slate-800',
      toggle: 'bg-slate-600 dark:bg-slate-300',
      iconLight: 'text-amber-400',
      iconDark: 'text-indigo-500',
    },
  };

  const variantConfig = variants[variant] || variants.default;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
      
      <motion.button
        onClick={toggleTheme}
        className={`
          relative ${sizeConfig.container} rounded-full
          ${variantConfig.container}
          transition-colors duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          hover:shadow-md
          flex items-center
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        role="switch"
        aria-checked={isDark}
      >
        {/* Animated Toggle Circle */}
        <motion.div
          className={`
            ${sizeConfig.toggle} rounded-full
            ${variantConfig.toggle}
            flex items-center justify-center
            absolute left-0.5 top-1/2 -translate-y-1/2
          `}
          initial={false}
          animate={{
            x: isDark ? sizeConfig.translate : '0px',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          {/* Icon inside toggle circle */}
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 360 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {isDark ? (
              <Moon 
                size={sizeConfig.icon} 
                className={variantConfig.iconDark}
                fill="currentColor"
              />
            ) : (
              <Sun 
                size={sizeConfig.icon} 
                className={variantConfig.iconLight}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Background Icons (optional decorative) */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <Sun 
            size={sizeConfig.icon - 4} 
            className={`transition-opacity duration-300 ${
              isDark ? 'opacity-30' : 'opacity-0'
            } text-amber-400`}
          />
          <Moon 
            size={sizeConfig.icon - 4} 
            className={`transition-opacity duration-300 ${
              isDark ? 'opacity-0' : 'opacity-30'
            } text-indigo-400`}
          />
        </div>
      </motion.button>

      {/* Optional label after toggle */}
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:hidden">
          {isDark ? '🌙' : '☀️'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
