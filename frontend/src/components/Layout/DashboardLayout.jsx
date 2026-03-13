import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import HamburgerMenu from './HamburgerMenu';

const DashboardLayout = ({ 
  children, 
  sidebarItems,
  activeItem,
  onNavigate,
  showHamburger = true,
  hamburgerPlacement = 'top-left',
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar on desktop
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const contentVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <DashboardSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeItem={activeItem}
        onNavigate={(item) => {
          if (onNavigate) {
            onNavigate(item);
          }
          // Auto-close on mobile after navigation
          if (isMobile) {
            setSidebarOpen(false);
          }
        }}
        customItems={sidebarItems}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Hamburger Menu Button - Fixed Position */}
        {showHamburger && isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              fixed z-[60] 
              ${hamburgerPlacement === 'top-left' ? 'top-4 left-4' : ''}
              ${hamburgerPlacement === 'top-right' ? 'top-4 right-4' : ''}
              ${hamburgerPlacement === 'bottom-left' ? 'bottom-4 left-4' : ''}
              ${hamburgerPlacement === 'bottom-right' ? 'bottom-4 right-4' : ''}
            `}
          >
            <HamburgerMenu
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              variant="default"
              size="md"
            />
          </motion.div>
        )}

        {/* Page Content */}
        <motion.main
          variants={contentVariants}
          initial="initial"
          animate="animate"
          className={`
            flex-1 
            ${isMobile ? 'p-4 pt-16' : 'p-6 lg:p-8'} 
            ${!isMobile && 'lg:ml-0'}
            ${className}
          `}
        >
          {children}
        </motion.main>
      </div>

      {/* Keyboard Navigation Hint */}
      {sidebarOpen && isMobile && (
        <div className="fixed bottom-4 right-4 z-[70] bg-white rounded-xl px-3 py-2 shadow-lg border border-slate-200 text-xs text-black">
          <span>Press ESC to close</span>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;