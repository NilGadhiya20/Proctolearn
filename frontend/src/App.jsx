import React, { useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './context/store';
import { ThemeProvider as CustomThemeProvider, useThemeContext } from './context/themeContext';
import { initKeyboardFocusDetection } from './utils/focusDetection';

// Import accessibility styles
import './styles/accessibility.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateQuiz from './pages/CreateQuiz';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ManageUsers from './pages/ManageUsers';
import MyQuizzes from './pages/MyQuizzes';
import ViewReports from './pages/ViewReports';
import SystemSettings from './pages/SystemSettings';
import MonitorSessions from './pages/MonitorSessions';
import ReviewFlags from './pages/ReviewFlags';
import GradeSubmissions from './pages/GradeSubmissions';
import AvailableQuizzes from './pages/AvailableQuizzes';
import StudentProfile from './pages/StudentProfile';
import QuizAttempt from './pages/QuizAttempt';
import FacultyMonitoring from './pages/FacultyMonitoring';
import LiveMonitoringPanel from './pages/LiveMonitoringPanel';
import ProtectedRoute from './components/ProtectedRoute';

// Create Material-UI Themes
const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#16a34a',
      light: '#22c55e',
      dark: '#15803d',
      contrastText: '#fff',
    },
    secondary: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
      contrastText: '#fff',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#0ea5e9',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 700,
      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.5rem' },
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' },
      lineHeight: 1.5,
    },
    body1: {
      fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem', lg: '1.1rem' },
      lineHeight: 1.6,
    },
    body2: {
      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
      lineHeight: 1.5,
    },
    caption: {
      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem', lg: '0.9rem' },
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
          minHeight: { xs: '40px', md: '44px' },
          minWidth: { xs: '40px', md: '44px' },
          fontSize: { xs: '0.85rem', md: '0.95rem' },
          px: { xs: 1.5, md: 3 },
          '&:hover': {
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: { xs: '8px', md: '12px' },
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out',
            minHeight: { xs: '40px', md: '44px' },
            fontSize: { xs: '0.85rem', md: '0.95rem' },
            '&:hover fieldset': {
              borderColor: '#16a34a',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#16a34a',
              boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.1)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'all 0.3s ease-in-out',
          borderRadius: { xs: '8px', md: '12px' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: { xs: '0.75rem', md: '0.85rem' },
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: { xs: '36px', md: '40px' },
          minWidth: { xs: '36px', md: '40px' },
        },
      },
    },
  },
});

const AppRoutes = () => {
  const location = useLocation();
  const { isDark } = useThemeContext();

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute requiredRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-quiz"
            element={
              <ProtectedRoute requiredRoles={['faculty', 'admin']}>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-quizzes"
            element={
              <ProtectedRoute requiredRoles={['faculty', 'admin']}>
                <MyQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-reports"
            element={
              <ProtectedRoute requiredRoles={['admin', 'faculty']}>
                <ViewReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-settings"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitor-sessions"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <MonitorSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review-flags"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <ReviewFlags />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grade-submissions"
            element={
              <ProtectedRoute requiredRoles={['faculty', 'admin']}>
                <GradeSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/available-quizzes"
            element={
              <ProtectedRoute requiredRoles={['student']}>
                <AvailableQuizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute requiredRoles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute requiredRoles={['student']}>
                <QuizAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/monitoring"
            element={
              <ProtectedRoute requiredRoles={['faculty', 'admin']}>
                <FacultyMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/monitoring/:id"
            element={
              <ProtectedRoute requiredRoles={['faculty', 'admin']}>
                <LiveMonitoringPanel />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
};

const AppWrapper = () => {
  console.log('AppWrapper rendering...');
  const { isDark } = useThemeContext();
  console.log('Theme context loaded, isDark:', isDark);
  const { initializeFromLocalStorage } = useAuthStore();

  useEffect(() => {
    console.log('Initializing from localStorage...');
    initializeFromLocalStorage();
    
    // Initialize keyboard focus detection for accessibility
    const cleanup = initKeyboardFocusDetection();
    return cleanup;
  }, [initializeFromLocalStorage]);

  // Create theme based on isDark state
  const theme = useMemo(() => {
    console.log('Creating theme with isDark:', isDark);
    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: '#16a34a',
          light: '#22c55e',
          dark: '#15803d',
          contrastText: isDark ? '#f5f5f5' : '#fff',
        },
        secondary: {
          main: '#059669',
          light: '#10b981',
          dark: '#047857',
          contrastText: isDark ? '#f5f5f5' : '#fff',
        },
        success: {
          main: '#10b981',
        },
        error: {
          main: '#ef4444',
        },
        warning: {
          main: '#f59e0b',
        },
        info: {
          main: '#0ea5e9',
        },
        background: {
          default: isDark ? '#0f172a' : '#f5f7fa',
          paper: isDark ? '#1e293b' : '#ffffff',
        },
        text: {
          primary: isDark ? '#f1f5f9' : '#1e293b',
          secondary: isDark ? '#cbd5e1' : '#64748b',
        },
        divider: isDark ? '#334155' : '#e2e8f0',
      },
      typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
        h1: {
          fontWeight: 700,
          fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
          lineHeight: 1.2,
        },
        h2: {
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
          lineHeight: 1.3,
        },
        h3: {
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
          lineHeight: 1.3,
        },
        h4: {
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
          lineHeight: 1.4,
        },
        h5: {
          fontWeight: 600,
          fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.5rem' },
          lineHeight: 1.4,
        },
        h6: {
          fontWeight: 600,
          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' },
          lineHeight: 1.5,
        },
        body1: {
          fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem', lg: '1.1rem' },
          lineHeight: 1.6,
        },
        body2: {
          fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
          lineHeight: 1.5,
        },
        caption: {
          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem', lg: '0.9rem' },
          lineHeight: 1.5,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: 'none',
              transition: 'all 0.3s ease-in-out',
              minHeight: { xs: '40px', md: '44px' },
              minWidth: { xs: '40px', md: '44px' },
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              px: { xs: 1.5, md: 3 },
              '&:hover': {
                boxShadow: isDark 
                  ? '0 4px 12px rgba(34, 197, 94, 0.2)' 
                  : '0 4px 12px rgba(22, 163, 74, 0.3)',
              },
            },
            containedPrimary: {
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: { xs: '8px', md: '12px' },
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              boxShadow: isDark 
                ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
                : '0 1px 3px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease-in-out',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              '&:hover': {
                boxShadow: isDark 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.08)',
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              background: isDark ? '#1e293b' : '#ffffff',
              boxShadow: isDark 
                ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
                : '0 1px 3px rgba(0, 0, 0, 0.05)',
              borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              color: isDark ? '#f1f5f9' : '#1e293b',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                transition: 'all 0.3s ease-in-out',
                minHeight: { xs: '40px', md: '44px' },
                fontSize: { xs: '0.85rem', md: '0.95rem' },
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                '&:hover fieldset': {
                  borderColor: '#16a34a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#16a34a',
                  boxShadow: isDark 
                    ? '0 0 0 3px rgba(22, 163, 74, 0.2)' 
                    : '0 0 0 3px rgba(22, 163, 74, 0.1)',
                },
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              transition: 'all 0.3s ease-in-out',
              borderRadius: { xs: '8px', md: '12px' },
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: { xs: '0.75rem', md: '0.85rem' },
            },
          },
        },
        MuiGrid: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s ease-in-out',
            },
          },
        },
        MuiBox: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s ease-in-out',
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              minHeight: { xs: '36px', md: '40px' },
              minWidth: { xs: '36px', md: '40px' },
            },
          },
        },
      },
    });
  }, [isDark]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App = () => {
  console.log('App component rendering...');
  
  try {
    return (
      <CustomThemeProvider>
        <AppWrapper />
      </CustomThemeProvider>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error in App Component</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }
};

export default App;
