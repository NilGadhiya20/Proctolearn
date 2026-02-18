import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { useThemeContext } from '../../context/themeContext';

const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  children, 
  enableSwipeGestures = true,
  swipeThreshold = 100,
  backdropBlur = true,
  position = 'left' // 'left' or 'right'
}) => {
  const { isDark } = useThemeContext();
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-300, 0], [0, 1]);

  // Swipe to close functionality
  const handleDragEnd = useCallback((event, info) => {
    setIsDragging(false);
    
    if (!enableSwipeGestures) return;
    
    const threshold = swipeThreshold;
    const velocity = info.velocity.x;
    
    if (position === 'left') {
      // Swipe left to close
      if (info.offset.x < -threshold || velocity < -500) {
        onClose();
      }
    } else {
      // Swipe right to close
      if (info.offset.x > threshold || velocity > 500) {
        onClose();
      }
    }
  }, [enableSwipeGestures, swipeThreshold, position, onClose]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    closed: {
      x: position === 'left' ? '-100%' : '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    }
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className={`
              fixed inset-0 z-40
              ${backdropBlur ? 'backdrop-blur-sm' : ''} 
              bg-black/40
            `}
            style={{ 
              backdropFilter: backdropBlur ? 'blur(8px)' : 'none',
              WebkitBackdropFilter: backdropBlur ? 'blur(8px)' : 'none' 
            }}
          />

          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            drag={enableSwipeGestures ? 'x' : false}
            dragConstraints={
              position === 'left' 
                ? { left: -400, right: 0 }
                : { left: 0, right: 400 }
            }
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ 
              x: enableSwipeGestures ? x : 0,
              opacity: enableSwipeGestures ? opacity : 1,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            className={`
              fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} 
              h-full w-80 max-w-[85vw]
              ${isDark 
                ? 'bg-slate-900/95 border-slate-700/60' 
                : 'bg-white/95 border-slate-200/60'
              }
              backdrop-blur-xl
              border-${position === 'left' ? 'r' : 'l'}
              shadow-2xl z-50
              ${isDragging ? 'shadow-3xl' : ''}
              transition-shadow duration-200
            `}
          >
            {/* Drag Indicator */}
            {enableSwipeGestures && (
              <div 
                className={`
                  absolute top-4 ${position === 'left' ? 'right-4' : 'left-4'} 
                  w-1 h-12 rounded-full cursor-grab active:cursor-grabbing
                  transition-colors
                  ${isDark 
                    ? 'bg-slate-600/60 hover:bg-slate-500/60' 
                    : 'bg-slate-300/60 hover:bg-slate-400/60'
                  }
                `}
              />
            )}

            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className={`
                  p-2 rounded-xl shadow-sm transition-colors
                  ${isDark 
                    ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-slate-100' 
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                  }
                `}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Swipe Hint */}
            {enableSwipeGestures && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: isDragging ? 0 : 1 }}
                className={`
                  absolute bottom-6 ${position === 'left' ? 'left-6' : 'right-6'}
                  flex items-center gap-2 text-xs
                  ${isDark ? 'text-slate-500' : 'text-slate-400'}
                `}
              >
                <ChevronLeft size={14} className={position === 'right' ? 'rotate-180' : ''} />
                <span>Swipe to close</span>
              </motion.div>
            )}

            {/* Content */}
            <div className="h-full overflow-hidden">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;