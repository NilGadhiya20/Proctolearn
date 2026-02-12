import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from './theme/muiTheme';

// Scroll to top on route change with smooth animation
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
  
  return null;
}

// Import landing page
import Landing from './pages/Landing';

// Lazy load other pages
const Login = React.lazy(() => import('./pages/Login').catch(e => { console.error('Login import error:', e); return { default: () => <div>Error loading Login</div> }; }));
const Register = React.lazy(() => import('./pages/Register').catch(e => { console.error('Register import error:', e); return { default: () => <div>Error loading Register</div> }; }));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').catch(e => { console.error('AdminDashboard import error:', e); return { default: () => <div>Error loading AdminDashboard</div> }; }));
const FacultyDashboard = React.lazy(() => import('./pages/FacultyDashboard').catch(e => { console.error('FacultyDashboard import error:', e); return { default: () => <div>Error loading FacultyDashboard</div> }; }));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard').catch(e => { console.error('StudentDashboard import error:', e); return { default: () => <div>Error loading StudentDashboard</div> }; }));
const MyQuizzes = React.lazy(() => import('./pages/MyQuizzes').catch(e => { console.error('MyQuizzes import error:', e); return { default: () => <div>Error loading MyQuizzes</div> }; }));
const CreateQuiz = React.lazy(() => import('./pages/CreateQuiz').catch(e => { console.error('CreateQuiz import error:', e); return { default: () => <div>Error loading CreateQuiz</div> }; }));
const GradeSubmissions = React.lazy(() => import('./pages/GradeSubmissions').catch(e => { console.error('GradeSubmissions import error:', e); return { default: () => <div>Error loading GradeSubmissions</div> }; }));
const ViewReports = React.lazy(() => import('./pages/ViewReports').catch(e => { console.error('ViewReports import error:', e); return { default: () => <div>Error loading ViewReports</div> }; }));
const MonitorSessions = React.lazy(() => import('./pages/MonitorSessions').catch(e => { console.error('MonitorSessions import error:', e); return { default: () => <div>Error loading MonitorSessions</div> }; }));
const ReviewFlags = React.lazy(() => import('./pages/ReviewFlags').catch(e => { console.error('ReviewFlags import error:', e); return { default: () => <div>Error loading ReviewFlags</div> }; }));
const ManageUsers = React.lazy(() => import('./pages/ManageUsers').catch(e => { console.error('ManageUsers import error:', e); return { default: () => <div>Error loading ManageUsers</div> }; }));
const SystemSettings = React.lazy(() => import('./pages/SystemSettings').catch(e => { console.error('SystemSettings import error:', e); return { default: () => <div>Error loading SystemSettings</div> }; }));
const AvailableQuizzes = React.lazy(() => import('./pages/AvailableQuizzes').catch(e => { console.error('AvailableQuizzes import error:', e); return { default: () => <div>Error loading AvailableQuizzes</div> }; }));
const QuizAttempt = React.lazy(() => import('./pages/QuizAttempt').catch(e => { console.error('QuizAttempt import error:', e); return { default: () => <div>Error loading QuizAttempt</div> }; }));
const Profile = React.lazy(() => import('./pages/Profile').catch(e => { console.error('Profile import error:', e); return { default: () => <div>Error loading Profile</div> }; }));
const FacultyLiveMonitoring = React.lazy(() => import('./pages/FacultyLiveMonitoring').catch(e => { console.error('FacultyLiveMonitoring import error:', e); return { default: () => <div>Error loading FacultyLiveMonitoring</div> }; }));
const Chat = React.lazy(() => import('./pages/Chat').catch(e => { console.error('Chat import error:', e); return { default: () => <div>Error loading Chat</div> }; }));
const Support = React.lazy(() => import('./pages/Support').catch(e => { console.error('Support import error:', e); return { default: () => <div>Error loading Support</div> }; }));

// Placeholder page for settings and support
const SettingsPage = () => <div style={{ padding: '20px' }}>Settings Page - Coming Soon</div>;

// Loading fallback
function LoadingFallback() {
  return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>Loading...</div>;
}

const AppWorking = () => {
  console.log('AppWorking rendering');

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <ScrollToTop />
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/system-settings" element={<SystemSettings />} />
            
            {/* Faculty Routes */}
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/my-quizzes" element={<MyQuizzes />} />
            <Route path="/create-quiz" element={<CreateQuiz />} />
            <Route path="/grade-submissions" element={<GradeSubmissions />} />
            <Route path="/view-reports" element={<ViewReports />} />
            <Route path="/monitor-sessions" element={<MonitorSessions />} />
            <Route path="/review-flags" element={<ReviewFlags />} />
            <Route path="/monitoring" element={<FacultyLiveMonitoring />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/available-quizzes" element={<AvailableQuizzes />} />
            <Route path="/quiz/:quizId" element={<QuizAttempt />} />
            
            {/* Common Routes - Available for all roles */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<Support />} />
            <Route path="/chat" element={<Chat />} />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default AppWorking;
