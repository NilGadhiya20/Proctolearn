import React from 'react';
import { motion } from 'framer-motion';

const AuthLoader = ({ message = "Verifying..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6 min-w-[320px] border border-emerald-200"
      >
        {/* Simple rotating spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full"
        />

        {/* Animated loading dots */}
        <div className="flex items-center gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2.5 h-2.5 rounded-full bg-emerald-500"
            />
          ))}
        </div>

        {/* Status text with animation */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-center"
        >
          <h3 className="text-lg font-semibold text-slate-700">
            {message}
          </h3>
          <p className="text-sm text-slate-500 mt-2">This may take a few seconds</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLoader;
