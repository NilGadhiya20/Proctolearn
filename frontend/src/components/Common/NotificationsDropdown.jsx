import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  FileText, 
  Flag,
  Clock,
  Eye
} from 'lucide-react';
import { 
  IconButton, 
  Badge, 
  Box, 
  Typography, 
  Divider,
  Button,
  Chip
} from '@mui/material';
import socket from '../../socket';
import { useAuthStore } from '../../context/store';
import { getAllQuizzes } from '../../services/quizService';
import {
  fetchNotificationFeed,
  markNotificationRead as markNotificationReadApi,
  markAllNotificationsRead as markAllNotificationsReadApi
} from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const dropdownRef = useRef(null);
  const { user } = useAuthStore();
  const audioContextRef = useRef(null);
  const recentNotificationKeysRef = useRef(new Map());

  const formatLabel = (value) => {
    if (!value) return 'Activity';
    return String(value)
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const normalizeIncomingNotification = (notification) => {
    const rawTimestamp = notification?.timestamp || notification?.createdAt;
    const parsedTimestamp = rawTimestamp ? new Date(rawTimestamp) : new Date();
    const serverId = notification?.id || notification?._id || notification?.serverId;

    return {
      id: serverId || `${notification?.type || 'notification'}-${parsedTimestamp.getTime()}`,
      serverId,
      type: notification?.type || 'system',
      severity: notification?.severity || 'info',
      title: notification?.title || formatLabel(notification?.type) || 'Notification',
      message: notification?.message || notification?.body || 'You have a new notification',
      timestamp: parsedTimestamp,
      read: Boolean(notification?.read),
      data: notification?.data || notification?.context || notification?.metadata || notification?.details || {}
    };
  };

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && user) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, [user]);

  // Load persisted notifications and register socket channel (works across devices)
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadFeed = async () => {
      try {
        const feed = await fetchNotificationFeed();
        if (!isMounted) return;
        const normalized = feed.map((item) => normalizeIncomingNotification({ ...item, read: item.read }));
        setNotifications(normalized);
        setUnreadCount(normalized.filter((n) => !n.read).length);
      } catch (error) {
        console.error('Failed to load notification feed:', error);
      }
    };

    loadFeed();

    socket.emit('register-notification-channel', {
      userId: user._id,
      role: user.role,
      institutionId: user.institution
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Play notification sound using Web Audio API
  const playNotificationSound = (severity) => {
    if (!audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different sounds for different severity levels
      if (severity === 'critical' || severity === 'high') {
        // Urgent alert sound - higher pitch, longer
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (severity === 'medium') {
        // Warning sound - medium pitch
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
      } else {
        // Gentle info sound - lower pitch, short
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Show browser push notification
  const showBrowserNotification = (notification) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notif = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: notification.type,
        requireInteraction: notification.severity === 'critical' || notification.severity === 'high',
        silent: false,
        vibrate: notification.severity === 'critical' || notification.severity === 'high' ? [200, 100, 200] : [100],
        timestamp: notification.timestamp.getTime(),
      });

      notif.onclick = () => {
        window.focus();
        setIsOpen(true);
        notif.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.severity !== 'critical' && notification.severity !== 'high') {
        setTimeout(() => notif.close(), 5000);
      }
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const joinFacultyQuizRooms = async () => {
      if (user.role !== 'faculty' && user.role !== 'admin') return;
      try {
        const response = await getAllQuizzes();
        const quizzes = response?.data || [];
        if (!isMounted) return;

        quizzes.forEach((quiz) => {
          if (quiz?._id) {
            socket.emit('joinQuiz', { quizId: quiz._id, role: user.role });
          }
        });
      } catch (error) {
        console.error('Failed to join quiz rooms for notifications:', error);
      }
    };

    // Join appropriate rooms based on role
    if (user.role === 'admin') {
      socket.emit('join-dashboard', { institutionId: user.institution });
    }
    joinFacultyQuizRooms();

    socket.on('notification', (payload) => {
      const normalized = normalizeIncomingNotification(payload);
      addNotification(normalized);
    });

    // Listen for quiz activities
    socket.on('activity-logged', (data) => {
      if (user.role === 'faculty' || user.role === 'admin') {
        // Violation-type events are sent as dedicated alerts; skip to avoid duplicate notifications.
        const violationActivities = ['fullscreen_exit', 'tab_change', 'page_visibility_change', 'window_blur'];
        if (violationActivities.includes(data.activityType)) {
          return;
        }

        const studentLabel = data.studentName
          ? `${data.studentName}${data.studentEmail ? ` (${data.studentEmail})` : ''}`
          : (data.studentId || 'unknown student');

        addNotification({
          type: 'activity',
          severity: data.severity,
          title: `Student Activity Detected`,
          message: `${formatLabel(data.activityType)} detected: ${studentLabel}`,
          timestamp: new Date(data.timestamp),
          data: data
        });
      }
    });

    // Listen for alerts
    socket.on('alert', (data) => {
      if (user.role === 'faculty' || user.role === 'admin') {
        const studentLabel = data.studentName
          ? `${data.studentName}${data.studentEmail ? ` (${data.studentEmail})` : ''}`
          : (data.studentId || 'unknown student');

        addNotification({
          type: 'violation',
          severity: data.severity,
          title: `⚠️ ${formatLabel(data.alertType)}`,
          message: `Alert for ${studentLabel}: ${data.message || formatLabel(data.activity) || 'Suspicious activity detected'}`,
          timestamp: new Date(),
          data: data
        });
      }
    });

    // Listen for submission completions
    socket.on('submission-complete', (data) => {
      if (user.role === 'faculty' || user.role === 'admin') {
        addNotification({
          type: 'quiz',
          severity: 'info',
          title: '✓ Quiz Submitted',
          message: `Student ${data.studentId} completed their quiz`,
          timestamp: new Date(),
          data: data
        });
      }
    });

    // Listen for dashboard activities (admin only)
    socket.on('dashboard-activity', (data) => {
      if (user.role === 'admin') {
        addNotification({
          type: 'system',
          severity: 'info',
          title: 'System Update',
          message: `${data.type}: Quiz ${data.quizId}`,
          timestamp: new Date(data.timestamp),
          data: data
        });
      }
    });

    // Cleanup
    return () => {
      isMounted = false;
      socket.off('notification');
      socket.off('activity-logged');
      socket.off('alert');
      socket.off('submission-complete');
      socket.off('dashboard-activity');
    };
  }, [user]);

  // Add new notification
  const addNotification = (notification, options = {}) => {
    const normalized = normalizeIncomingNotification(notification);
    const dedupKeyParts = [
      normalized.serverId || '',
      normalized.type,
      normalized.title,
      normalized.message,
      normalized.data?.submissionId || normalized.data?.submission || '',
      normalized.data?.studentId || normalized.data?.student || ''
    ];
    const dedupKey = dedupKeyParts.join('|');
    const now = Date.now();
    const existingAt = recentNotificationKeysRef.current.get(dedupKey);

    if (existingAt && now - existingAt < 4000) {
      return;
    }

    recentNotificationKeysRef.current.set(dedupKey, now);

    // Keep dedup map compact.
    if (recentNotificationKeysRef.current.size > 200) {
      const cutoff = now - 60000;
      for (const [key, ts] of recentNotificationKeysRef.current.entries()) {
        if (ts < cutoff) {
          recentNotificationKeysRef.current.delete(key);
        }
      }
    }

    const newNotification = {
      read: false,
      ...normalized
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    setUnreadCount(prev => prev + (newNotification.read ? 0 : 1));

    if (!options.silent) {
      playNotificationSound(normalized.severity);
      showBrowserNotification(newNotification);

      if (normalized.severity === 'low' || normalized.severity === 'info') {
        setTimeout(() => {
          markAsRead(newNotification.id, newNotification.serverId);
        }, 10000);
      }
    }
  };

  // Mark notification as read
  const markAsRead = (id, serverId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (serverId) {
      markNotificationReadApi(serverId).catch((error) => {
        console.error('Failed to mark notification as read:', error);
      });
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
    markAllNotificationsReadApi().catch((error) => {
      console.error('Failed to mark all notifications as read:', error);
    });
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type, severity) => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'violation':
        return <AlertTriangle {...iconProps} />;
      case 'quiz':
        return <FileText {...iconProps} />;
      case 'activity':
        return <Eye {...iconProps} />;
      case 'system':
        return <Info {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  // Get color based on severity
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'var(--red-500)';
      case 'medium':
        return 'var(--amber-500)';
      case 'low':
      case 'info':
        return 'var(--blue-500)';
      default:
        return 'var(--green-500)';
    }
  };

  // Get background color for notification
  const getNotificationBgColor = (notification) => {
    if (!notification.read) {
      return 'var(--green-500-alpha-05)';
    }
    return 'transparent';
  };

  return (
    <Box ref={dropdownRef} sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Bell Icon Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            color: isOpen ? 'var(--green-600)' : '#64748b',
            padding: { xs: '8px' },
            minWidth: { xs: '36px' },
            minHeight: { xs: '36px' },
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'var(--green-500-alpha-10)',
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                animation: unreadCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    opacity: 1
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.8
                  }
                }
              }
            }}
          >
            <motion.div
              animate={unreadCount > 0 ? {
                rotate: [0, -15, 15, -15, 15, 0],
              } : {}}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
                repeat: unreadCount > 0 ? Infinity : 0,
                repeatDelay: 3
              }}
            >
              <Bell size={20} />
            </motion.div>
          </Badge>
        </IconButton>
      </motion.div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: '380px',
              maxWidth: '90vw',
              maxHeight: '500px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 9999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <Box sx={{
              p: 2,
              background: 'linear-gradient(135deg, var(--green-600) 0%, var(--green-700) 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bell size={20} />
                <Typography variant="h6" sx={{ fontWeight: '700', fontSize: '1rem' }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Chip 
                    label={unreadCount} 
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: '700',
                      height: '20px',
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </Box>
              <IconButton
                onClick={() => setIsOpen(false)}
                size="small"
                sx={{ color: 'white', '&:hover': { background: 'rgba(255, 255, 255, 0.1)' } }}
              >
                <X size={18} />
              </IconButton>
            </Box>

            {/* Action Buttons */}
            {notifications.length > 0 && (
              <Box sx={{
                px: 2,
                py: 1,
                display: 'flex',
                gap: 1,
                borderBottom: '1px solid #e2e8f0'
              }}>
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'var(--green-600)',
                    '&:hover': {
                      background: 'var(--green-500-alpha-08)'
                    }
                  }}
                >
                  Mark all read
                </Button>
                <Button
                  size="small"
                  onClick={clearAll}
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'var(--red-500)',
                    '&:hover': {
                      background: 'var(--red-500-alpha-08)'
                    }
                  }}
                >
                  Clear all
                </Button>
              </Box>
            )}

            {/* Notifications List */}
            <Box sx={{
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f5f9'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e1',
                borderRadius: '3px',
                '&:hover': {
                  background: '#94a3b8'
                }
              }
            }}>
              <AnimatePresence mode="popLayout">
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 6,
                      px: 3,
                      textAlign: 'center'
                    }}>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        <Bell size={48} color="#cbd5e1" />
                      </motion.div>
                      <Typography variant="body2" sx={{ mt: 2, color: '#64748b', fontWeight: '600' }}>
                        No notifications yet
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 0.5, color: '#94a3b8' }}>
                        We'll notify you when something happens
                      </Typography>
                    </Box>
                  </motion.div>
                ) : (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                      layout
                    >
                      <Box
                        onClick={() => !notification.read && markAsRead(notification.id, notification.serverId)}
                        sx={{
                          p: 2,
                          cursor: notification.read ? 'default' : 'pointer',
                          backgroundColor: getNotificationBgColor(notification),
                          borderLeft: `3px solid ${getSeverityColor(notification.severity)}`,
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: notification.read ? '#f8fafc' : 'var(--green-500-alpha-08)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          {/* Icon */}
                          <Box
                            sx={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: `${getSeverityColor(notification.severity)}15`,
                              color: getSeverityColor(notification.severity),
                              flexShrink: 0
                            }}
                          >
                            {getNotificationIcon(notification.type, notification.severity)}
                          </Box>

                          {/* Content */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.read ? '500' : '700',
                                color: '#1e293b',
                                fontSize: '0.85rem',
                                mb: 0.5,
                                lineHeight: 1.4
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#64748b',
                                fontSize: '0.75rem',
                                display: 'block',
                                mb: 0.5,
                                lineHeight: 1.3
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Clock size={12} color="#94a3b8" />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#94a3b8',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </Typography>
                              {!notification.read && (
                                <Box
                                  sx={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--green-600)',
                                    ml: 'auto',
                                    animation: 'pulse 2s ease-in-out infinite',
                                    '@keyframes pulse': {
                                      '0%, 100%': { opacity: 1 },
                                      '50%': { opacity: 0.5 }
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </Box>

            {/* Footer */}
            {notifications.length > 0 && (
              <Box sx={{
                p: 1.5,
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <Button
                  fullWidth
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    color: 'var(--green-600)',
                    fontWeight: '600',
                    '&:hover': {
                      background: 'var(--green-500-alpha-08)'
                    }
                  }}
                >
                  View all notifications
                </Button>
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default NotificationsDropdown;
