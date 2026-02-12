import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, HelpCircle, LogIn, UserPlus, BookOpen, Zap, BarChart3, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../context/store';

const AuthNavbar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isAuthenticated = !!user;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    // Navigate to landing page if not already there
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-emerald-200/60 shadow-lg fixed top-0 left-0 right-0 w-full z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-emerald-200/50 hover:scale-110 transition-all duration-300 cursor-pointer">
              <span className="text-white font-bold text-xl">PL</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-lime-500 bg-clip-text text-transparent tracking-tight cursor-pointer">
              Proctolearn
            </span>
          </Link>

          {/* Desktop Nav Links - Center */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 mx-1 sm:mx-2 md:mx-4 lg:mx-10">
            <Link to="/" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300" title="Home">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm md:text-base">Home</span>
            </Link>
            {isAuthenticated && user?.role === 'student' && (
              <Link to="/available-quizzes" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300" title="Quizzes">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base">Quizzes</span>
              </Link>
            )}
            <button onClick={() => scrollToSection('features')} className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300" title="Features">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm md:text-base">Features</span>
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300" title="How it Works">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline text-sm xl:text-base">How it Works</span>
            </button>
            <Link to="/pricing" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300" title="Pricing">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline text-sm xl:text-base">Pricing</span>
            </Link>
            <Link to="/support" className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold py-2 px-2 hover:scale-110 transition-all duration-300" title="Help">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline text-sm xl:text-base">Help</span>
            </Link>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-2 lg:gap-3">
            {!isLoginPage && (
              <Link
                to="/login"
                className="nav-link flex items-center gap-1.5 text-emerald-700 hover:text-white font-bold px-2 sm:px-3 lg:px-6 py-2 lg:py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-500 hover:to-lime-500 hover:shadow-lg hover:scale-110 transition-all duration-300 border-2 border-transparent hover:border-emerald-400"
                title="Login"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base">Login</span>
              </Link>
            )}
            {!isRegisterPage && (
              <Link
                to="/register"
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold px-2 sm:px-3 md:px-4 lg:px-8 py-2 lg:py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-1 hover:scale-110 hover:from-emerald-600 hover:to-lime-600 transition-all duration-400 transform-gpu active:scale-95"
                title="Sign Up"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base">Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </nav>
  );
};

export default AuthNavbar;

