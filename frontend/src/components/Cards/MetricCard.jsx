import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue',
  delay = 0,
  trend,
  loading = false
}) => {
  const colorSchemes = {
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      hover: 'hover:bg-blue-100',
      ring: 'ring-blue-200'
    },
    green: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      hover: 'hover:bg-emerald-100',
      ring: 'ring-emerald-200'
    },
    orange: {
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      hover: 'hover:bg-orange-100',
      ring: 'ring-orange-200'
    },
    red: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
      hover: 'hover:bg-red-100',
      ring: 'ring-red-200'
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      hover: 'hover:bg-purple-100',
      ring: 'ring-purple-200'
    },
    cyan: {
      text: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      hover: 'hover:bg-cyan-100',
      ring: 'ring-cyan-200'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-20" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.05, duration: 0.3 }}
      whileHover={{ 
        scale: 1.03, 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={`
        relative group
        bg-white rounded-xl p-4 
        border border-slate-100 
        shadow-sm hover:shadow-md
        transition-all duration-300
        cursor-pointer overflow-hidden
      `}
    >
      {/* Hover Background Effect */}
      <div className={`absolute inset-0 ${scheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Icon */}
        <motion.div 
          className={`
            p-2.5 rounded-lg ${scheme.bg} ${scheme.text}
            group-hover:scale-110 transition-transform duration-300
            ring-2 ring-transparent group-hover:${scheme.ring}
          `}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Icon size={20} strokeWidth={2.5} />
        </motion.div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className={`text-lg font-bold ${scheme.text} group-hover:scale-105 transition-transform duration-200 inline-block`}>
            {value}
          </p>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay * 0.05 + 0.2 }}
            className={`
              text-xs font-bold px-2 py-1 rounded-full
              ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 
                trend < 0 ? 'bg-red-100 text-red-700' : 
                'bg-slate-100 text-slate-700'}
            `}
          >
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </motion.div>
        )}
      </div>

      {/* Subtle Border Animation */}
      <motion.div
        className={`absolute inset-0 rounded-xl border-2 ${scheme.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
    </motion.div>
  );
};

export default MetricCard;