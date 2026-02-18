import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import CountUp from '../CountUp';

const ModernStatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  change, 
  trend = 'up',
  color = 'blue',
  delay = 0,
  loading = false
}) => {
  const gradients = {
    blue: 'from-blue-600 via-blue-500 to-indigo-600',
    purple: 'from-purple-600 via-purple-500 to-fuchsia-600',
    green: 'from-emerald-600 via-emerald-500 to-teal-600',
    orange: 'from-orange-500 via-orange-400 to-red-500',
    cyan: 'from-cyan-500 via-cyan-400 to-blue-500',
    rose: 'from-rose-500 via-rose-400 to-pink-500',
    indigo: 'from-indigo-600 via-indigo-500 to-purple-600',
    yellow: 'from-yellow-500 via-yellow-400 to-orange-400',
  };

  const shadows = {
    blue: 'shadow-blue-500/30 hover:shadow-blue-500/40',
    purple: 'shadow-purple-500/30 hover:shadow-purple-500/40',
    green: 'shadow-emerald-500/30 hover:shadow-emerald-500/40',
    orange: 'shadow-orange-500/30 hover:shadow-orange-500/40',
    cyan: 'shadow-cyan-500/30 hover:shadow-cyan-500/40',
    rose: 'shadow-rose-500/30 hover:shadow-rose-500/40',
    indigo: 'shadow-indigo-500/30 hover:shadow-indigo-500/40',
    yellow: 'shadow-yellow-500/30 hover:shadow-yellow-500/40',
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const trendColors = {
    up: 'text-emerald-300',
    down: 'text-red-300',
    neutral: 'text-slate-300'
  };

  const TrendIcon = trendIcons[trend];

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-6 bg-slate-100 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 bg-slate-200 rounded-xl" />
          <div className="w-16 h-6 bg-slate-200 rounded-full" />
        </div>
        <div className="w-24 h-4 bg-slate-200 rounded mb-2" />
        <div className="w-16 h-8 bg-slate-200 rounded mb-2" />
        <div className="w-32 h-3 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: delay * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`
        relative overflow-hidden rounded-2xl p-6 text-white 
        bg-gradient-to-br ${gradients[color]}
        shadow-xl ${shadows[color]}
        transition-all duration-300 cursor-pointer group
      `}
    >
      {/* Abstract Background Shapes */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/5 rounded-full blur-2xl" />
      
      {/* Large Background Icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 transition-all duration-500 ease-out group-hover:opacity-20 group-hover:rotate-12 group-hover:scale-110">
        <Icon size={100} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Icon */}
          <motion.div 
            className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg group-hover:bg-white/30 transition-all duration-300"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Icon size={24} strokeWidth={2} />
          </motion.div>

          {/* Change Badge */}
          {change && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay * 0.1 + 0.3, type: 'spring' }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/20 text-white rounded-full backdrop-blur-md border border-white/10 shadow-lg"
            >
              <TrendIcon size={12} className={trendColors[trend]} />
              <span className="text-xs font-bold tracking-wide">{change}</span>
            </motion.div>
          )}
        </div>

        {/* Title */}
        <p className="text-sm text-white/90 font-semibold mb-1 tracking-wide uppercase">
          {title}
        </p>

        {/* Value */}
        <h3 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg">
          <CountUp end={typeof value === 'number' ? value : 0} duration={2} />
          {typeof value === 'string' && value}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-white/75 font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          repeatDelay: 3,
          duration: 1.5,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
};

export default ModernStatCard;