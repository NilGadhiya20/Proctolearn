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
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '../../context/store';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardSidebar = ({ open, onClose, activeItem, onNavigate, customItems }) => {
  const { user, logout } = useAuthStore();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 },
  };

  const handleItemClick = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={isMobile ? (open ? 'open' : 'closed') : 'open'}
        variants={sidebarVariants}
        className={`fixed lg:static inset-y-0 left-0 z-[10000] w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-2xl lg:shadow-none`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold">
                PL
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg">Proctolearn</h1>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Admin Panel</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              if (onNavigate) {
                // Button mode for internal state navigation
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              // Link mode for routing
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && window.innerWidth < 1024 && onClose()}
                  className={({ isActive: isRouteActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                      isRouteActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 justify-center px-4 py-2 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-100 transition-colors text-sm font-semibold shadow-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
