import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Users, BarChart3, Lock, CheckCircle, Clock, Shield, Award, Video, FileText, Zap, LogIn, HelpCircle, Home, CreditCard, BookOpen, UserPlus, GraduationCap, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useAuthStore } from '../context/store';
import { useEscapeKey, useFocusTrap } from '../hooks/useKeyboardNavigation';
import LandingNavbar from '../components/Layout/LandingNavbar';
import '../styles/navbar.css';

// Counter Animation Hook
const useCounter = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(endTime - now, 0);
      const progress = 1 - remaining / duration;
      
      countRef.current = Math.floor(progress * (end - start) + start);
      setCount(countRef.current);
      
      if (remaining === 0) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration, start, isInView]);
  
  return [count, setIsInView];
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mobileMenuRef = useRef(null);
  
  // Counter animations
  const [users, setUsersInView] = useCounter(500, 2000);
  const [accuracy, setAccuracyInView] = useCounter(98, 2000);
  const [support, setSupportInView] = useCounter(24, 1500);
  
  // Close mobile menu with Escape key
  useEscapeKey(mobileMenuOpen, () => setMobileMenuOpen(false));
  
  // Trap focus in mobile menu when open
  useFocusTrap(mobileMenuOpen, mobileMenuRef);

  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-lime-50 min-h-screen">
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        body {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        .nav-link {
          position: relative;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #10B981, #84CC16);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        
        .scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }
        
        /* Enhanced Button Effects */
        button, a {
          position: relative;
        }
        
        button:active, a:active {
          transform: scale(0.95) !important;
        }
        
        @keyframes button-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8), 0 0 60px rgba(132, 204, 22, 0.6); }
        }
        
        .hover\:scale-110:hover {
          animation: button-glow 2s ease-in-out infinite;
        }
        
        .hover\:scale-115:hover {
          animation: button-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Navbar - GRAMS Style */}
      <LandingNavbar scrollToSection={scrollToSection} />

      {/* Hero Section */}
      <main className="pt-16 sm:pt-20">
      <section className="relative bg-gradient-to-br from-emerald-500 via-emerald-400 to-lime-400 min-h-[80vh] sm:min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white text-center lg:text-left"
            >
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 border border-white/30 pulse-glow"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                ></motion.div>
                OFFICIAL PORTAL
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                Smarter<br />
                Assessment,<br />
                <span className="text-white/90">Faster Results.</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                A unified platform for Students, Faculty, and Administrators to create, take, and monitor secure proctored quizzes efficiently.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
                <Link to="/register" className="bg-white text-emerald-600 font-bold px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_rgba(16,185,129,0.6)] hover:-translate-y-2 transition-all duration-400 text-center hover:scale-105 sm:hover:scale-110 active:scale-95 hover:bg-gradient-to-r hover:from-white hover:to-emerald-50 relative overflow-hidden group">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-lime-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-400"></div>
                </Link>
                <button onClick={() => scrollToSection('features')} className="bg-white/20 backdrop-blur-md border-2 sm:border-3 border-white text-white font-bold px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-white hover:text-emerald-600 hover:shadow-[0_20px_60px_rgba(255,255,255,0.5)] hover:scale-105 sm:hover:scale-110 hover:-translate-y-2 transition-all duration-400 active:scale-95 relative overflow-hidden group">
                  <span className="relative z-10">View Features</span>
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                </button>
              </div>

              {/* Stats with Counter Animation */}
              <motion.div 
                className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  onViewportEnter={() => setUsersInView(true)}
                  className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30 hover:bg-white/30 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold mb-1"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >{users}+</motion.div>
                  <div className="text-xs sm:text-sm text-emerald-50">Active Users</div>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  onViewportEnter={() => setAccuracyInView(true)}
                  className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30 hover:bg-white/30 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold mb-1"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >{accuracy}%</motion.div>
                  <div className="text-xs sm:text-sm text-emerald-50">Accuracy</div>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  onViewportEnter={() => setSupportInView(true)}
                  className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30 hover:bg-white/30 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold mb-1"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >{support}/7</motion.div>
                  <div className="text-xs sm:text-sm text-emerald-50">Support</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Image - Visible on all screens */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group w-full"
            >
              {/* Floating decorative elements */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 z-0"
              />
              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full blur-xl opacity-60 z-0"
              />
              
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-xl sm:shadow-2xl overflow-hidden z-10">
                <div className="overflow-hidden rounded-xl sm:rounded-2xl relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                      alt="Students Learning"
                      className="rounded-xl sm:rounded-2xl w-full h-auto transform group-hover:scale-110 transition-transform duration-700 ease-out cursor-pointer object-cover"
                    />
                  </motion.div>
                  
                  {/* Premium Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-bold shadow-lg bounce-slow"
                  >
                    ✨ PREMIUM
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <motion.span 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 scale-pulse"
            >
              ABOUT SYSTEM
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4"
            >
              Centralized Proctored Assessment Platform
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-4"
            >
              Proctolearn is a transparent, accountable platform that connects students with educators to conduct secure AI-proctored quizzes efficiently.
            </motion.p>
          </div>
          
          {/* Add Image Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto mt-16"
          >
            <div className="relative group overflow-hidden rounded-3xl shadow-2xl border-8 border-white">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=700&fit=crop"
                alt="Team Collaboration"
                className="w-full h-auto cursor-pointer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <motion.div
                className="absolute inset-0 shimmer pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Cards Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white dark:from-slate-900 to-emerald-50/50 dark:to-slate-800/50 transition-colors duration-300" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 - AI Proctoring */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full overflow-hidden">
                <motion.div 
                  className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">AI Proctoring</h3>
                <p className="text-emerald-50 text-sm sm:text-base leading-relaxed">
                  Advanced AI monitors student activity with 98% accuracy. Real-time alerts for suspicious behavior, gaze tracking, and audio monitoring.
                </p>
                {/* Animated Corner Accent */}
                <motion.div
                  className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>

            {/* Feature 2 - Quiz Management */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full overflow-hidden">
                <motion.div 
                  className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Create & Manage</h3>
                <p className="text-green-50 text-sm sm:text-base leading-relaxed">
                  Faculty can create quizzes with ease. Add questions, set time limits, configure proctoring settings, and track student performance in real-time.
                </p>
                {/* Animated Corner Accent */}
                <motion.div
                  className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>

            {/* Feature 3 - Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible.features ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full overflow-hidden">
                <motion.div 
                  className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Detailed Analytics</h3>
                <p className="text-orange-50 text-sm sm:text-base leading-relaxed">
                  Comprehensive reports and public dashboards. Track performance metrics, flag reviews, and generate detailed analytics for stakeholders.
                </p>
                {/* Animated Corner Accent */}
                <motion.div
                  className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden" data-animate>
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4 shadow-lg">
              PROCESS
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">
              How Proctolearn Works
            </h2>
            <p className="text-slate-300 text-lg">Simple, secure, and seamless assessment process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: 1, title: 'Create', desc: 'Faculty creates quiz with questions', icon: '📝', color: 'from-green-400 to-emerald-500', borderColor: 'border-green-400' },
              { num: 2, title: 'Attempt', desc: 'Students take proctored quiz', icon: '🎥', color: 'from-teal-400 to-teal-500', borderColor: 'border-teal-400' },
              { num: 3, title: 'Review', desc: 'AI analyzes & flags violations', icon: '👁️', color: 'from-orange-400 to-red-500', borderColor: 'border-orange-400' },
              { num: 4, title: 'Results', desc: 'Instant grades with reports', icon: '🏆', color: 'from-purple-400 to-pink-500', borderColor: 'border-purple-400' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                animate={isVisible['how-it-works'] ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 border-2 ${step.borderColor} cursor-pointer overflow-hidden`}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>

                {/* Number badge */}
                <div className={`relative w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 mx-auto`}>
                  <span className="relative z-10">{step.num}</span>
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
                </div>

                {/* Icon */}
                <div className="text-4xl mb-3 text-center group-hover:scale-125 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-slate-300 leading-relaxed text-center text-sm group-hover:text-slate-100 transition-colors duration-300">
                  {step.desc}
                </p>

                {/* Hover border glow */}
                <div className={`absolute inset-0 rounded-3xl border-2 ${step.borderColor} opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section id="why-different" className="py-20 bg-gradient-to-br from-white via-lime-50/30 to-emerald-50/50" data-animate>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
              BENEFITS
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Proctolearn is Different
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Features List */}
            <div className="space-y-6">
              {[
                { icon: Eye, title: 'AI-Powered Monitoring', desc: 'Real-time proctoring with 98% accuracy. Face detection, gaze tracking, and audio analysis.', color: 'emerald' },
                { icon: Zap, title: 'Instant Results', desc: 'Automatic grading with instant feedback. No waiting time for objective assessments.', color: 'teal' },
                { icon: Users, title: 'Multi-Role Support', desc: 'Designed for students, faculty, and admins with role-specific dashboards.', color: 'orange' },
                { icon: Lock, title: 'Bank-Grade Security', desc: 'End-to-end encryption with secure data storage. ISO compliant and SSL certified.', color: 'purple' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isVisible['why-different'] ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 relative group overflow-hidden"
                >
                  {/* Animated background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-${feature.color}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-lg`}
                    >
                      <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right - Image with Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible['why-different'] ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop"
                  alt="Student Success"
                  className="w-full h-auto transform group-hover:scale-110 transition-transform duration-700 ease-out cursor-pointer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent group-hover:from-slate-900/70 transition-all duration-500"></div>
                
                {/* Stats Overlay */}
                <motion.div 
                  className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.2
                      }
                    }
                  }}
                  initial="hidden"
                  whileInView="show"
                >
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      show: { opacity: 1, scale: 1 }
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    <motion.div 
                      className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-lime-500 bg-clip-text text-transparent mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      98%
                    </motion.div>
                    <div className="text-sm text-slate-700 font-semibold">Detection Rate</div>
                  </motion.div>
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      show: { opacity: 1, scale: 1 }
                    }}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    <motion.div 
                      className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      2.5s
                    </motion.div>
                    <div className="text-sm text-slate-700 font-semibold">Avg Response</div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ 
            y: [0, -40, 0],
            x: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ 
            y: [0, 40, 0],
            x: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"
        />
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Ready to Revolutionize<br />Your Assessments?
            </h2>
            <p className="text-2xl text-emerald-50 mb-12 max-w-3xl mx-auto">
              Join hundreds of educators and thousands of students using secure AI-powered proctoring today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link 
                to="/register"
                className="bg-white text-emerald-700 font-bold px-14 py-6 rounded-2xl text-xl shadow-2xl border-2 border-white/80 hover:text-white hover:border-emerald-200 hover:shadow-[0_28px_80px_rgba(16,185,129,0.55)] hover:scale-110 hover:-translate-y-2 transition-all duration-500 inline-flex items-center gap-2 active:scale-95 relative overflow-hidden group focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Sign Up Now
                  <CheckCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-lime-500 translate-y-full group-hover:translate-y-0 transition-transform duration-400"></div>
              </Link>
              <Link
                to="/login"
                className="border-3 border-white text-white font-bold px-14 py-6 rounded-2xl text-xl hover:bg-white hover:text-emerald-600 hover:shadow-[0_25px_70px_rgba(255,255,255,0.5)] hover:scale-115 hover:-translate-y-2 transition-all duration-400 active:scale-95 backdrop-blur-sm bg-white/10"
              >
                Track Existing Quiz
              </Link>
            </div>

            <p className="text-emerald-100 text-lg">
              <CheckCircle className="inline w-5 h-5 mr-2" />
              Free to start • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                  Proctolearn
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                AI-Powered Proctored Assessment Platform - Making online education secure, transparent and accountable.
              </p>
              <div className="flex gap-3">
                {[
                  { name: 'Facebook', icon: Facebook },
                  { name: 'Twitter', icon: Twitter },
                  { name: 'Instagram', icon: Instagram },
                  { name: 'LinkedIn', icon: Linkedin }
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                  <a
                    key={social.name}
                    href="#"
                    aria-label={social.name}
                    className="w-12 h-12 rounded-lg bg-slate-800/95 border border-slate-700 text-slate-200 hover:text-white hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-lime-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/35 active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">QUICK LINKS</h3>
              <ul className="space-y-3">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/available-quizzes', label: 'Available Quizzes' },
                  { to: '/create-quiz', label: 'Create Quiz' },
                  { onClick: () => scrollToSection('features'), label: 'Features' }
                ].map((link, idx) => (
                  <li key={idx}>
                    {link.to ? (
                      <Link to={link.to} className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 hover:scale-105 transition-all duration-200 text-sm inline-block">
                        {link.label}
                      </Link>
                    ) : (
                      <button onClick={link.onClick} className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 hover:scale-105 transition-all duration-200 text-sm">
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">RESOURCES</h3>
              <ul className="space-y-3">
                {['Documentation', 'FAQ', 'Blog'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200 text-sm inline-block">{item}</a>
                  </li>
                ))}
                <li>
                  <Link to="/support" className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200 text-sm inline-block">Contact</Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">LEGAL</h3>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200 text-sm inline-block">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get In Touch */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">GET IN TOUCH</h3>
              <ul className="space-y-4">
                {[
                  { icon: 'envelope', color: 'emerald', label: 'Email', value: 'support@proctolearn.com', href: 'mailto:support@proctolearn.com' },
                  { icon: 'phone', color: 'lime', label: 'Phone', value: '+91-9909246267', href: 'tel:+919909246267' },
                  { icon: 'map-marker-alt', color: 'emerald', label: 'Address', value: 'Ahmedabad, Gujarat' }
                ].map((contact, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`text-${contact.color}-400 mt-1`}>
                      <i className={`fas fa-${contact.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{contact.label}</p>
                      {contact.href ? (
                        <a href={contact.href} className="text-slate-400 text-sm hover:text-emerald-400 transition-colors">
                          {contact.value}
                        </a>
                      ) : (
                        <p className="text-slate-400 text-sm">{contact.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stay Updated Section */}
          <div className="border-t border-slate-800 pt-12 pb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-2xl mb-2">Stay Updated</h3>
                  <p className="text-slate-400 text-sm">
                    Subscribe to get updates on new features, quizzes, and educational content.
                  </p>
                </div>
                <div className="flex-1 w-full md:max-w-md">
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button className="bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-emerald-500/60 hover:-translate-y-1 transition-all duration-400 hover:scale-110 hover:from-emerald-600 hover:to-lime-600 active:scale-95 relative overflow-hidden group">
                      <span className="relative z-10">Subscribe</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">
                © 2026 Proctolearn. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                {[
                  { icon: 'shield-alt', label: 'SSL Certified', color: 'emerald' },
                  { icon: 'lock', label: 'Bank-grade Security', color: 'emerald' },
                  { icon: 'check-circle', label: 'ISO Compliant', color: 'lime' }
                ].map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <i className={`fas fa-${badge.icon} text-${badge.color}-400`}></i>
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

