import React from 'react';
import { motion } from 'framer-motion';

const AuthLoader = ({ message = "Authenticating..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[320px] border-4 border-green-100"
      >
        {/* Animated Shield Icon */}
        <div className="relative">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-4"
          >
            <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-green-500 border-r-teal-500"></div>
          </motion.div>

          {/* Middle pulsing ring */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 -m-2"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-400/30 to-teal-400/30"></div>
          </motion.div>

          {/* Shield icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <svg 
              className="w-10 h-10 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" 
              />
            </svg>
          </motion.div>

          {/* Sparkle effects */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              style={{
                top: i === 0 ? '0%' : i === 1 ? '100%' : '50%',
                left: i === 0 || i === 1 ? '50%' : i === 2 ? '0%' : '100%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>

        {/* Animated text */}
        <div className="text-center">
          <motion.h3
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl font-bold text-slate-800 mb-2"
          >
            {message}
          </motion.h3>
          
          {/* Loading dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  backgroundColor: [
                    'rgb(22, 163, 74)',
                    'rgb(13, 148, 136)',
                    'rgb(22, 163, 74)'
                  ]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Secure connection indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 text-xs text-slate-500"
        >
          <motion.svg
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm6 10c0 .55-.45 1-1 1s-1-.45-1-1-.45-1-1-1-1 .45-1 1-.45 1-1 1-1-.45-1-1 .45-1 1-1 1 .45 1 1z" />
          </motion.svg>
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="font-semibold"
          >
            Secure connection established
          </motion.span>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-full w-1/2 bg-gradient-to-r from-green-500 via-teal-500 to-green-500 rounded-full"
          />
        </div>

        {/* Verification steps */}
        <div className="w-full space-y-2">
          {[
            { label: 'Verifying credentials', delay: 0 },
            { label: 'Establishing secure session', delay: 0.3 },
            { label: 'Loading dashboard', delay: 0.6 }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
                x: 0
              }}
              transition={{
                opacity: {
                  duration: 2,
                  repeat: Infinity,
                  delay: step.delay,
                  ease: "easeInOut"
                },
                x: { duration: 0.3 }
              }}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: step.delay,
                  ease: "easeInOut"
                }}
                className="w-1.5 h-1.5 rounded-full bg-green-500"
              />
              <span>{step.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLoader;
