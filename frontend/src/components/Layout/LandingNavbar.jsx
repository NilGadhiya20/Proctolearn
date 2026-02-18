import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Zap, BarChart3, CreditCard, HelpCircle, LogIn, UserPlus, Menu, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../context/store';
import HamburgerMenu from './HamburgerMenu';
import MobileSidebar from './MobileSidebar';
import '../../styles/navbar.css';

const LandingNavbar = ({ scrollToSection }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (id) => {
    setMobileMenuOpen(false); // Close mobile menu when navigating
    if (scrollToSection) {
      scrollToSection(id);
    } else {
      navigate('/#' + id);
    }
  };

  const handleNavigation = (path) => {
    setMobileMenuOpen(false); // Close mobile menu when navigating
    navigate(path);
  };

  const isLandingPage = window.location.pathname === '/';

  const navLinks = [
    { to: '/', label: 'Home', icon: Home, show: true },
    { to: '/available-quizzes', label: 'Quizzes', icon: BookOpen, show: user?.role === 'student' },
    { onClick: () => handleScroll('features'), label: 'Features', icon: Zap, show: true },
    { onClick: () => handleScroll('how-it-works'), label: 'How it Works', icon: BarChart3, show: true },
    { to: '/pricing', label: 'Pricing', icon: CreditCard, show: true },
    { to: '/support', label: 'Help', icon: HelpCircle, show: true },
  ];

  return (
    <>
      <nav className={`
        bg-white/95 border-emerald-200/60
        backdrop-blur-xl border-b shadow-lg fixed top-0 left-0 right-0 w-full z-[9990] transition-colors duration-300
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Hamburger Menu - Mobile Only */}
            <div className="lg:hidden flex items-center gap-2">
              <HamburgerMenu 
                isOpen={mobileMenuOpen}
                onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                variant="outline"
                size="md"
              />
            </div>

            {/* Logo - Left */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className={`
                w-10 h-10 sm:w-12 sm:h-12 
                bg-gradient-to-br from-emerald-500 to-lime-500 
                rounded-2xl flex items-center justify-center shadow-lg 
                ring-2 ring-emerald-200/50
                hover:scale-110 transition-all duration-300 cursor-pointer
              `}>
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className={`
                text-xl sm:text-2xl font-bold 
                bg-gradient-to-r from-emerald-600 to-lime-500 
                bg-clip-text text-transparent tracking-tight cursor-pointer
                hidden xs:inline
              `}>
                Proctolearn
              </span>
            </Link>

            {/* Desktop Nav Links - Center */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-6 mx-4 lg:mx-10">
              {navLinks.filter(link => link.show).map((link, idx) => {
                const Icon = link.icon;
                return link.to ? (
                  <Link 
                    key={idx}
                    to={link.to} 
                    className={`
                      nav-link flex items-center gap-1.5 
                      text-emerald-700 hover:text-emerald-800
                      font-bold py-2 px-2 hover:scale-110 transition-all duration-300
                    `}
                  >
                    <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
                    <span className="text-sm xl:text-base">{link.label}</span>
                  </Link>
                ) : (
                  <button 
                    key={idx}
                    onClick={link.onClick}
                    className={`
                      nav-link flex items-center gap-1.5 
                      text-emerald-700 hover:text-emerald-800
                      font-bold py-2 px-2 hover:scale-110 transition-all duration-300
                    `}
                  >
                    <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
                    <span className="text-sm xl:text-base">{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Side - Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!user ? (
                <>
                  {/* Login - Always visible */}
                  <Link
                    to="/login"
                    className={`
                      flex items-center gap-1.5 
                      text-emerald-700 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-lime-500
                      font-bold px-3 lg:px-6 py-2 lg:py-3 rounded-xl 
                      hover:shadow-lg hover:scale-105 transition-all duration-300 
                      border-2 border-transparent hover:border-emerald-400
                    `}
                  >
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm lg:text-base">Login</span>
                  </Link>
                  
                  {/* Sign Up - Always visible */}
                  <Link
                    to="/register"
                    className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold px-3 sm:px-4 md:px-6 lg:px-8 py-2 lg:py-3 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-1 hover:scale-105 hover:from-emerald-600 hover:to-lime-600 transition-all duration-400 transform-gpu active:scale-95"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm lg:text-base">Sign Up</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-slate-600 font-medium hidden md:inline text-sm lg:text-base">
                    Hi, {user.firstName}
                  </span>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100 text-emerald-700 border-white flex items-center justify-center font-bold border-2 shadow-sm text-sm sm:text-base">
                    {user.firstName?.[0]}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <div className="px-6 pt-6">
          {/* Logo in Mobile Menu */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              Proctolearn
            </span>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="space-y-2">
            {navLinks.filter(link => link.show).map((link, idx) => {
              const Icon = link.icon;
              return link.to ? (
                <Link
                  key={idx}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl
                    text-slate-700 hover:bg-emerald-50 hover:text-emerald-700
                    font-semibold transition-all duration-200
                    border border-transparent hover:border-emerald-200
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={link.onClick}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl
                    text-slate-700 hover:bg-emerald-50 hover:text-emerald-700
                    font-semibold transition-all duration-200
                    border border-transparent hover:border-emerald-200
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Auth Buttons */}
          {!user && (
            <div className="mt-8 space-y-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center justify-center gap-2 w-full
                  bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                  font-bold px-6 py-3 rounded-xl
                  transition-all duration-300
                  border-2 border-emerald-200
                `}
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-lime-600 transition-all duration-300"
              >
                <UserPlus className="w-5 h-5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </MobileSidebar>
    </>
  );
};

export default LandingNavbar;
