import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/store';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
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
  Moon,
  Sun,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationsDropdown from '../Common/NotificationsDropdown';

const Header = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      setHasAnimated(true);
      isFirstLoad.current = false;
    }
  }, []);

  const navigationItems = useMemo(() => {
    const baseItems = {
      admin: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Manage Users', path: '/manage-users' },
        { icon: FileText, label: 'Create Quiz', path: '/create-quiz' },
        { icon: BarChart3, label: 'View Reports', path: '/view-reports' },
        { icon: Eye, label: 'Monitor Sessions', path: '/monitor-sessions' },
        { icon: Flag, label: 'Review Flags', path: '/review-flags' },
        { icon: Settings, label: 'System Settings', path: '/system-settings' },
      ],
      faculty: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/faculty/dashboard' },
        { icon: FileText, label: 'My Quizzes', path: '/my-quizzes' },
        { icon: Plus, label: 'Create Quiz', path: '/create-quiz' },
        { icon: CheckCircle, label: 'Grade Submissions', path: '/grade-submissions' },
        { icon: BarChart3, label: 'View Reports', path: '/view-reports' },
      ],
      student: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
        { icon: BookOpen, label: 'Available Quizzes', path: '/available-quizzes' },
      ],
    };

    return baseItems[user?.role] || [];
  }, [user?.role]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
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
      admin: '#16a34a',
      faculty: '#059669',
      student: '#10b981',
    };
    return colors[role] || '#64748b';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getDashboardPath = () => {
    const roleRoutes = {
      admin: '/admin/dashboard',
      faculty: '/faculty/dashboard',
      student: '/student/dashboard',
    };
    return roleRoutes[user?.role] || '/';
  };

  const handleLogoClick = () => {
    const dashboardPath = getDashboardPath();
    navigate(dashboardPath);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppBar 
      position="fixed" 
      component={motion.div}
      initial={hasAnimated ? { y: -100 } : false}
      animate={hasAnimated ? { y: 0 } : false}
      transition={hasAnimated ? { duration: 0.5, type: 'spring', stiffness: 100 } : {}}
      sx={{
        background: scrolled 
          ? 'rgba(255, 255, 255, 0.98)' 
          : 'linear-gradient(90deg, #ffffff 0%, #f8fafb 100%)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
        color: '#1e293b',
        boxShadow: scrolled 
          ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
          : '0 1px 3px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        zIndex: 1300,
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: { xs: 1, md: 1.5 },
        px: { xs: 1.5, sm: 2, md: 4 },
        minHeight: { xs: '56px', sm: '64px', md: '72px' },
        gap: { xs: 1, md: 2 }
      }}>
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box 
            onClick={handleLogoClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            <Box sx={{
              borderRadius: '12px',
              width: { xs: '36px', md: '40px' },
              height: { xs: '36px', md: '40px' },
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src="/logo.svg" alt="Proctolearn logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" sx={{ 
                fontWeight: '800', 
                color: '#16a34a', 
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                lineHeight: 1,
                letterSpacing: '-0.5px'
              }}>
                ProctoLearn
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#64748b', 
                fontSize: { xs: '0.65rem', md: '0.7rem' },
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: { xs: 'none', md: 'block' }
              }}>
                PORTAL
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Navigation Items - Desktop */}
        <Box sx={{ 
          display: { xs: 'none', lg: 'flex' }, 
          alignItems: 'center', 
          gap: { lg: 0.5, xl: 1 },
          flex: 1,
          justifyContent: 'center',
          px: { lg: 2, xl: 4 },
          overflowX: 'auto'
        }}>
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  onClick={() => {
                    navigate(item.path);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  startIcon={<Icon size={18} />}
                  sx={{
                    color: active ? '#16a34a' : '#64748b',
                    textTransform: 'none',
                    fontWeight: active ? '700' : '600',
                    fontSize: { lg: '0.85rem', xl: '0.9rem' },
                    px: { lg: 1.5, xl: 2 },
                    py: 1,
                    borderRadius: '8px',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      color: '#16a34a',
                      background: 'rgba(22, 163, 74, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                    '&::after': active ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '40%',
                      height: '3px',
                      background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                      borderRadius: '3px 3px 0 0',
                    } : {},
                  }}
                >
                  {item.label}
                </Button>
              </motion.div>
            );
          })}
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1, lg: 2 } }}>
          {/* Mobile Menu Toggle */}
          <IconButton
            color="inherit"
            onClick={onMenuToggle}
            sx={{ 
              display: { xs: 'flex', lg: 'none' }, 
              color: '#16a34a',
              padding: { xs: '8px' },
              minWidth: { xs: '36px' },
              minHeight: { xs: '36px' },
              '&:hover': {
                background: 'rgba(22, 163, 74, 0.1)',
              }
            }}
          >
            ☰
          </IconButton>

          {/* Dark Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              sx={{
                color: darkMode ? '#fbbf24' : '#64748b',
                padding: { xs: '8px' },
                minWidth: { xs: '36px' },
                minHeight: { xs: '36px' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(22, 163, 74, 0.1)',
                  transform: 'rotate(180deg)',
                }
              }}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </IconButton>
          </motion.div>

          {/* Notifications Dropdown */}
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <NotificationsDropdown />
            </motion.div>
          )}

          {/* Login Button (if not logged in) */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={() => navigate('/login')}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#16a34a',
                  color: '#16a34a',
                  fontWeight: '700',
                  textTransform: 'none',
                  px: { xs: 1.5, md: 3 },
                  borderRadius: '8px',
                  fontSize: { xs: '0.8rem', md: '1rem' },
                  '&:hover': {
                    borderColor: '#15803d',
                    background: 'rgba(22, 163, 74, 0.05)',
                  }
                }}
              >
                Login
              </Button>
            </motion.div>
          )}

          {/* Support Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              startIcon={<MessageSquare size={16} />}
              onClick={() => navigate('/support')}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: 'white',
                fontWeight: '700',
                textTransform: 'none',
                px: { xs: 1.5, md: 3 },
                py: 0.8,
                borderRadius: '8px',
                fontSize: { xs: '0.75rem', md: '0.9rem' },
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                  boxShadow: '0 6px 16px rgba(22, 163, 74, 0.4)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Support
            </Button>
          </motion.div>

          {/* User Profile Section */}
          {user && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
              >
                <Typography variant="body2" sx={{ 
                  fontWeight: '700', 
                  color: '#1e293b',
                  display: { xs: 'none', md: 'block' },
                  fontSize: { md: '0.8rem', lg: '0.85rem' }
                }}>
                  {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                </Typography>
                <Chip
                  label={user?.role?.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: getRoleColor(user?.role),
                    color: 'white',
                    fontSize: { xs: '0.6rem', md: '0.65rem' },
                    fontWeight: '700',
                    height: { xs: '18px', md: '20px' },
                    mt: 0.3,
                    display: { xs: 'none', md: 'flex' },
                  }}
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar 
                    src={user?.profilePicture || ''}
                    sx={{ 
                      backgroundColor: getRoleColor(user?.role),
                      width: { xs: 36, md: 42 },
                      height: { xs: 36, md: 42 },
                      fontWeight: '700',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      boxShadow: `0 4px 12px ${getRoleColor(user?.role)}40`,
                    }}
                  >
                    {getInitials(user?.firstName, user?.lastName)}
                  </Avatar>
                </IconButton>
              </motion.div>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    minWidth: { xs: '160px', md: '200px' },
                  }
                }}
              >
                <MenuItem 
                  onClick={handleProfile}
                  sx={{
                    py: 1.5,
                    px: 2,
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    '&:hover': {
                      background: 'rgba(22, 163, 74, 0.08)',
                      color: '#16a34a',
                    }
                  }}
                >
                  <User size={18} style={{ marginRight: '12px' }} />
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={() => { navigate('/settings'); handleMenuClose(); }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    '&:hover': {
                      background: 'rgba(22, 163, 74, 0.08)',
                      color: '#16a34a',
                    }
                  }}
                >
                  <Settings size={18} style={{ marginRight: '12px' }} />
                  Settings
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    px: 2,
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    color: '#ef4444',
                    '&:hover': {
                      background: 'rgba(239, 68, 68, 0.08)',
                    }
                  }}
                >
                  <LogOut size={18} style={{ marginRight: '12px' }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>


    </AppBar>
  );
};

export default Header;
