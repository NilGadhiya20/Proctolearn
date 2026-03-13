import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../context/store';
import NotificationsDropdown from '../Common/NotificationsDropdown';
import { 
  LogOut, 
  Settings, 
  User, 
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Eye,
  Flag,
  CheckCircle,
  BookOpen,
  Plus,
  MessageSquare,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = useMemo(() => {
    const baseItems = {
      admin: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Manage Users', path: '/manage-users' },
        { icon: Users, label: 'View Students', path: '/students' },
        { icon: FileText, label: 'Create Quiz', path: '/create-quiz' },
        { icon: BarChart3, label: 'View Reports', path: '/view-reports' },
        { icon: Eye, label: 'Monitor', path: '/monitor-sessions' },
      ],
      faculty: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/faculty/dashboard' },
        { icon: FileText, label: 'My Quizzes', path: '/my-quizzes' },
        { icon: Plus, label: 'Create Quiz', path: '/create-quiz' },
        { icon: CheckCircle, label: 'Grade', path: '/grade-submissions' },
      ],
      student: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
        { icon: BookOpen, label: 'All Quizzes', path: '/available-quizzes' },
      ],
    };

    return baseItems[user?.role] || [];
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getInitials = (firstName, lastName) => {
    const initials = `${firstName || ''}${lastName || ''}`;
    return initials
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'from-emerald-500 to-green-600',
      faculty: 'from-indigo-500 to-purple-600',
      student: 'from-emerald-500 to-emerald-600',
    };
    return colors[role] || 'from-gray-500 to-slate-600';
  };

  return (
    <>
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
        .nav-link.active::after {
          width: 100%;
        }
        
        @keyframes button-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.7); }
        }
      `}</style>
      
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-[1000] border-b transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl border-emerald-200/60 shadow-lg py-2' 
            : 'bg-white/80 backdrop-blur-md border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo - Left */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-emerald-200/50 group-hover:shadow-[0_10px_25px_rgba(5,150,105,0.3)] group-hover:scale-110 transition-all duration-300">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-lime-500 bg-clip-text text-transparent tracking-tight group-hover:drop-shadow-md transition-all duration-300">
                  Proctolearn
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links - Center */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-sm">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'text-emerald-700 bg-white shadow-md shadow-emerald-200/50' 
                        : 'text-black hover:text-emerald-600 hover:bg-white/80 hover:shadow-[0_8px_20px_rgba(5,150,105,0.12)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-emerald-500' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Support Button - Desktop */}
              <Link 
                to="/support" 
                className="hidden md:flex items-center gap-2 text-black hover:text-emerald-600 font-semibold text-sm transition-all duration-300 rounded-lg px-3 py-2 hover:bg-emerald-50/50 hover:shadow-[0_4px_12px_rgba(5,150,105,0.08)] mr-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Support</span>
              </Link>

              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

              {/* Notifications */}
              <NotificationsDropdown />

              {/* User Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 p-1 rounded-full hover:bg-emerald-50/50 hover:shadow-[0_4px_12px_rgba(5,150,105,0.1)] transition-all duration-300 focus:outline-none"
                >
                  <div className="text-right hidden md:block mr-1">
                    <div className="text-sm font-bold text-black leading-tight">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-[10px] font-bold text-black uppercase tracking-wider">
                      {user?.role}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(user?.role)} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white hover:ring-emerald-300 hover:shadow-[0_8px_20px_rgba(5,150,105,0.3)] transition-all duration-300 cursor-pointer`}>
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
                    >
                      <div className="p-4 bg-slate-50 border-b border-slate-100 md:hidden">
                        <div className="font-bold text-black">{user?.firstName} {user?.lastName}</div>
                        <div className="text-xs text-black font-semibold uppercase">{user?.role}</div>
                        <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link 
                          to="/profile" 
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-black hover:text-emerald-600 hover:bg-emerald-50/80 rounded-xl transition-all duration-300 hover:shadow-[0_4px_12px_rgba(5,150,105,0.08)]"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link 
                          to="/settings" 
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-black hover:text-emerald-600 hover:bg-emerald-50/80 rounded-xl transition-all duration-300 hover:shadow-[0_4px_12px_rgba(5,150,105,0.08)]"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-xl transition-all duration-300 hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)]"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 text-black hover:text-emerald-600 hover:bg-emerald-50/50 hover:shadow-[0_4px_12px_rgba(5,150,105,0.1)] rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-black hover:text-emerald-600 hover:bg-emerald-50/80 font-medium transition-all duration-300 hover:shadow-[0_4px_12px_rgba(5,150,105,0.08)]"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="h-px bg-slate-100 my-2"></div>
                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-black hover:text-emerald-600 hover:bg-emerald-50/80 font-medium transition-all duration-300 hover:shadow-[0_4px_12px_rgba(5,150,105,0.08)]"
                >
                  <MessageSquare className="w-5 h-5" />
                  Support
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default DashboardNavbar;
