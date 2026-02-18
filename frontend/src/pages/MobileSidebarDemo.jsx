import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import HamburgerMenu from '../components/Layout/HamburgerMenu';
import MobileSidebar from '../components/Layout/MobileSidebar';
import '../styles/mobile-sidebar.css';

const MobileSidebarDemo = () => {
  const [activeDemo, setActiveDemo] = useState('layout');
  const [customSidebarOpen, setCustomSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', path: '/dashboard' },
    { icon: Users, label: 'Users', id: 'users', path: '/users' },
    { icon: FileText, label: 'Documents', id: 'documents', path: '/documents' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', id: 'settings', path: '/settings' },
  ];

  const demoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Demo Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Mobile Sidebar Demo</h1>
          <div className="flex gap-2">
            {['layout', 'components', 'gestures'].map((demo) => (
              <button
                key={demo}
                onClick={() => setActiveDemo(demo)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeDemo === demo
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {demo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          key={activeDemo}
          variants={demoVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
        >
          {activeDemo === 'layout' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">DashboardLayout Demo</h2>
                <p className="text-slate-600 mb-6">
                  A complete layout wrapper that handles sidebar and hamburger menu automatically.
                </p>
                
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '500px' }}>
                  <DashboardLayout
                    sidebarItems={sidebarItems}
                    activeItem={activeSidebarItem}
                    onNavigate={(item) => setActiveSidebarItem(item.id)}
                    hamburgerPlacement="top-left"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-800">Card {i}</h3>
                                <p className="text-sm text-slate-500">Demo content</p>
                              </div>
                            </div>
                            <div className="h-24 bg-gradient-to-br from-emerald-50 to-lime-50 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DashboardLayout>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'components' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Individual Components</h2>
                <p className="text-slate-600 mb-6">
                  Mix and match components for custom implementations.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hamburger Menu Variants */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">HamburgerMenu Variants</h3>
                    <div className="space-y-4">
                      {[
                        { variant: 'default', label: 'Default' },
                        { variant: 'primary', label: 'Primary' },
                        { variant: 'ghost', label: 'Ghost' },
                        { variant: 'outline', label: 'Outline' }
                      ].map((item) => (
                        <div key={item.variant} className="flex items-center gap-4">
                          <HamburgerMenu
                            isOpen={false}
                            onToggle={() => {}}
                            variant={item.variant}
                            size="md"
                            showLabel={true}
                          />
                          <span className="text-slate-700 font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Different Sizes */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Different Sizes</h3>
                    <div className="space-y-4">
                      {[
                        { size: 'sm', label: 'Small' },
                        { size: 'md', label: 'Medium' },
                        { size: 'lg', label: 'Large' }
                      ].map((item) => (
                        <div key={item.size} className="flex items-center gap-4">
                          <HamburgerMenu
                            isOpen={false}
                            onToggle={() => {}}
                            variant="outline"
                            size={item.size}
                          />
                          <span className="text-slate-700 font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 'gestures' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Touch Gestures Demo</h2>
                <p className="text-slate-600 mb-6">
                  Advanced mobile sidebar with swipe gestures and enhanced touch interactions.
                </p>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">MobileSidebar with Gestures</h3>
                    <button
                      onClick={() => setCustomSidebarOpen(true)}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus size={16} />
                      Open Sidebar
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                    <p className="mb-2"><strong>Try these gestures on mobile:</strong></p>
                    <ul className="space-y-1">
                      <li>• Swipe from left edge to open</li>
                      <li>• Swipe left to close</li>
                      <li>• Tap outside to close</li>
                      <li>• Press ESC key to close</li>
                    </ul>
                  </div>
                </div>

                <MobileSidebar
                  isOpen={customSidebarOpen}
                  onClose={() => setCustomSidebarOpen(false)}
                  enableSwipeGestures={true}
                  swipeThreshold={100}
                  backdropBlur={true}
                  position="left"
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-slate-800 mb-2">Custom Sidebar</h2>
                      <p className="text-slate-600 text-sm">With advanced touch gestures</p>
                    </div>

                    <nav className="flex-1 space-y-2">
                      {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left"
                          >
                            <Icon size={20} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="text-xs text-slate-500 text-center">
                        Swipe left or tap outside to close
                      </div>
                    </div>
                  </div>
                </MobileSidebar>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MobileSidebarDemo;