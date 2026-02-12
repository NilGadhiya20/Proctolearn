import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../context/store';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Collapse,
} from '@mui/material';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  Eye,
  Flag,
  CheckCircle,
  BookOpen,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = useMemo(() => {
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

  const handleNavigation = (path) => {
    navigate(path);
    onClose?.();
  };

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: 'linear-gradient(180deg, #0f766e 0%, #115e59 100%)',
          color: '#ffffff',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: '700', color: '#22c55e', fontSize: '1.2rem' }}>
          📚 ProctoLearn
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.5 }}>
          Secure Quiz System
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <ListItem
              key={index}
              onClick={() => handleNavigation(item.path)}
              sx={{
                background: active ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                borderLeft: active ? '3px solid #22c55e' : '3px solid transparent',
                borderRadius: '8px',
                mb: 1,
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                pl: 2.2,
                '&:hover': {
                  background: 'rgba(34, 197, 94, 0.1)',
                  pl: 2.5,
                },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#22c55e' : 'rgba(255, 255, 255, 0.7)', minWidth: 40, transition: 'color 0.3s ease' }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '0.95rem',
                    fontWeight: active ? '600' : '500',
                    color: active ? '#22c55e' : 'rgba(255, 255, 255, 0.85)',
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>


    </Drawer>
  );
};

export default Sidebar;
