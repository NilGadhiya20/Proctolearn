import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Eye, 
  Settings, 
  LogOut,
  X,
  School,
  Clock,
  BookOpen,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useAuthStore } from '../../context/store';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

const DashboardSidebar = ({ open, onClose, activeItem, onNavigate, customItems }) => {
  const { user, logout } = useAuthStore();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragControls = useDragControls();

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key to close sidebar
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open && isMobile) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, isMobile, onClose]);

  // Prevent background scroll when sidebar is open on mobile
  React.useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobile, open]);

  const defaultItems = [
    { icon: LayoutDashboard, label: 'Overview', id: 'overview', path: '/admin/dashboard' },
    { icon: Users, label: 'Manage Users', id: 'manage-users', path: '/manage-users' },
    { icon: FileText, label: 'Create Quiz', id: 'create-quiz', path: '/create-quiz' },
    { icon: BarChart3, label: 'View Reports', id: 'view-reports', path: '/view-reports' },
    { icon: Eye, label: 'Monitor Sessions', id: 'monitor-sessions', path: '/monitor-sessions' },
    { icon: Settings, label: 'Settings', id: 'settings', path: '/settings' },
  ];

  const items = customItems || defaultItems;

  const sidebarVariants = {
    open: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    closed: { 
      x: '-100%', 
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
  };

  const overlayVariants = {
    open: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    closed: { 
      opacity: 0,
      transition: { duration: 0.2 }
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (index) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: 'easeOut'
      }
    })
  };

  const handleItemClick = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
    if (onClose && isMobile) {
      onClose();
    }
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    // If dragged left more than 100px, close the sidebar
    if (info.offset.x < -100 && isMobile) {
      onClose();
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            style={{ WebkitBackdropFilter: 'blur(8px)' }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={isMobile ? (open ? 'open' : 'closed') : 'open'}
        variants={sidebarVariants}
        drag={isMobile && open ? "x" : false}
        dragControls={dragControls}
        dragConstraints={{ left: -288, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`
          ${isMobile ? 'fixed' : 'static'} 
          inset-y-0 left-0 z-50 w-72 
          bg-white/95 backdrop-blur-xl 
          border-r border-slate-200/60 
          shadow-2xl lg:shadow-lg
          ${isDragging ? 'shadow-3xl' : ''}
          transition-shadow duration-200
        `}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100/80">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold ring-2 ring-emerald-100">
                <GraduationCap size={20} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg">Proctolearn</h1>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {user?.role || 'Dashboard'}
                </span>
              </div>
            </motion.div>
            
            {isMobile && (
              <motion.button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
              </motion.button>
            )}

            {/* Drag handle for mobile */}
            {isMobile && (
              <div 
                className="absolute top-3 right-6 w-1 h-8 bg-slate-300 rounded-full cursor-grab active:cursor-grabbing opacity-30 hover:opacity-50 transition-opacity"
                onPointerDown={(e) => dragControls.start(e)}
              />
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              if (onNavigate) {
                // Button mode for internal state navigation
                return (
                  <motion.button
                    key={item.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                    }`}
                  >
                    <Icon size={20} className={`group-hover:scale-110 transition-transform duration-200 ${
                      isActive ? 'text-emerald-600' : ''
                    }`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    {isActive && !item.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                      />
                    )}
                  </motion.button>
                );
              }

              // Link mode for routing
              return (
                <motion.div
                  key={item.path}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <NavLink
                    to={item.path}
                    onClick={() => isMobile && onClose && onClose()}
                    className={({ isActive: isRouteActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group ${
                        isRouteActive
                          ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
                      }`
                    }
                  >
                    {({ isActive: isRouteActive }) => (
                      <>
                        <Icon size={20} className={`group-hover:scale-110 transition-transform duration-200 ${
                          isRouteActive ? 'text-emerald-600' : ''
                        }`} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white min-w-[20px] text-center">
                            {item.badge}
                          </span>
                        )}
                        {isRouteActive && !item.badge && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <motion.div 
            className="p-4 border-t border-slate-100 bg-slate-50/70"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="mb-3 p-3 bg-white/60 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 justify-center px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-sm font-semibold shadow-sm"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
