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
        className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 min-w-[320px] border border-cyan-200"
      >
        {/* Animated rotating gradient spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-400 p-1"
        >
          <div className="w-full h-full bg-white rounded-full" />
        </motion.div>

        {/* Animated loading dots */}
        <div className="flex items-center gap-3 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0.8, 1.3, 0.8],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 shadow-lg shadow-cyan-300"
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

        {/* Bottom animated line */}
        <motion.div
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: 100,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #0891b2, transparent)',
            borderRadius: 1,
            transformOrigin: 'center',
            marginTop: 4
          }}
        />
      </motion.div>
    </div>
  );
};

export default AuthLoader;
