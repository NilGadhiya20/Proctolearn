import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'stat-card':
        return (
          <div className={`bg-white rounded-2xl p-6 border border-slate-200 ${className}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="skeleton w-16 h-6 rounded-full" />
            </div>
            <div className="skeleton w-24 h-4 mb-2 rounded" />
            <div className="skeleton w-16 h-8 mb-2 rounded" />
            <div className="skeleton w-32 h-3 rounded" />
          </div>
        );

      case 'chart':
        return (
          <div className={`bg-white rounded-2xl p-6 border border-slate-200 ${className}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="skeleton w-32 h-6 rounded" />
              <div className="skeleton w-8 h-8 rounded" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-16 h-4 rounded" />
                  <div className="skeleton flex-1 h-8 rounded" style={{ width: `${Math.random() * 50 + 30}%` }} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${className}`}>
            <div className="p-6 border-b border-slate-200">
              <div className="skeleton w-32 h-6 rounded" />
            </div>
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton w-3/4 h-4 rounded" />
                    <div className="skeleton w-1/2 h-3 rounded" />
                  </div>
                  <div className="skeleton w-20 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'mini-card':
        return (
          <div className={`bg-white rounded-xl p-4 border border-slate-200 ${className}`}>
            <div className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="skeleton w-20 h-3 rounded" />
                <div className="skeleton w-16 h-4 rounded" />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`skeleton h-32 rounded-xl ${className}`} />
        );
    }
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </>
  );
};

export default SkeletonLoader;