import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../services/api';
import { useAuthStore } from '../context/store';
import { signInWithGoogle, completeSupabaseOAuth } from '../config/firebaseConfig';
import Reveal from '../components/Reveal';
import MotionImage from '../components/MotionImage';
import AuthLoader from '../components/Common/AuthLoader';
import AuthNavbar from '../components/Common/AuthNavbar';
import AuthFooter from '../components/Common/AuthFooter';
import { useTabNavigation } from '../hooks/useKeyboardNavigation';
import { KEYS } from '../utils/keyboardNavigation';

export default function Login() {
  console.log('🔵 Login Component Loaded');
  
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({
    studentEmail: '',
    studentPassword: '',
    facultyEmail: '',
    facultyPassword: '',
    adminEmail: '',
    adminPassword: '',
    adminCode: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const tabsRef = useRef(null);
  
  // Tab order mapping
  const tabs = ['student', 'faculty', 'admin'];
  const currentTabIndex = tabs.indexOf(activeTab);
  
  // Keyboard navigation for tabs
  const { handleKeyDown: handleTabKeyDown } = useTabNavigation(
    tabs.length,
    currentTabIndex,
    (newIndex) => setActiveTab(tabs[newIndex])
  );

  // Removed API health check to prevent exposing backend details

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const slideInRight = {
    initial: { opacity: 0, x: 60 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.1 }
    }
  };

  useEffect(() => {
    const handleSupabaseCallback = async () => {
      const hasOAuthParams =
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('refresh_token') ||
        window.location.search.includes('code=');

      if (!hasOAuthParams) return;

      // Check if we're in a popup window
      if (window.opener) {
        console.log('🔵 OAuth callback detected in popup, processing...');
        await completeSupabaseOAuth(); // This will handle sending message to parent
        return;
      }

      // Handle non-popup OAuth callback (fallback for direct navigation)
      setLoading(true);

      try {
        const session = await completeSupabaseOAuth();

        if (!session?.provider_token) {
          throw new Error('Google provider token not returned from Supabase.');
        }

        const response = await apiClient.post('/auth/google', {
          accessToken: session.provider_token,
          institutionCode: 'PPSU'
        });

        if (response.data.success) {
          const userData = response.data.data.user;
          const token = response.data.data.token;

          setToken(token);
          setUser(userData);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          const role = userData.role?.toLowerCase();
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'faculty') {
            navigate('/faculty/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        } else {
          toast.error(response.data.message || 'Google login failed.');
        }
      } catch (callbackError) {
        console.error('Supabase OAuth callback error:', callbackError);
        toast.error(
          callbackError.response?.data?.message ||
            callbackError.message ||
            'Google login failed.'
        );
      } finally {
        setLoading(false);
      }
    };

    handleSupabaseCallback();
  }, [navigate, setToken, setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e, role) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let email, password, adminCode;
      
      if (role === 'student') {
        email = formData.studentEmail;
        password = formData.studentPassword;
      } else if (role === 'faculty') {
        email = formData.facultyEmail;
        password = formData.facultyPassword;
      } else if (role === 'admin') {
        email = formData.adminEmail;
        password = formData.adminPassword;
        adminCode = formData.adminCode;
      }

      if (!email || !password) {
        toast.error('Please enter both email and password');
        setLoading(false);
        return;
      }

      if (role === 'admin' && !adminCode) {
        toast.error('Admin access code is required for Login');
        setLoading(false);
        return;
      }

      const payload = {
        email,
        password
      };

      if (role === 'admin') {
        payload.adminCode = adminCode;
      }

      console.log('📤 Sending login request:', { email, role });
      const response = await apiClient.post('/auth/login', payload);
      
      console.log('📥 Login response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        setToken(token);
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Login successful for user:', userData.email);
        toast.success(`Welcome back, ${userData.firstName}!`);
        
        // Navigate based on user role
        const userRole = userData.role?.toLowerCase();
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'faculty') {
          navigate('/faculty/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        const errorMsg = response.data.message || 'Login failed. Please try again.';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let errorMsg = 'Login failed. Please check your credentials.';
      
      if (error.message === 'Network Error') {
        errorMsg = '❌ Unable to connect to server. Please try again later.';
      } else if (error.response?.status === 401) {
        // Handle 401 specifically - invalid credentials
        const backendMsg = error.response?.data?.message || '';
        if (backendMsg.toLowerCase().includes('invalid') || 
            backendMsg.toLowerCase().includes('incorrect') ||
            backendMsg.toLowerCase().includes('password') ||
            backendMsg.toLowerCase().includes('email')) {
          errorMsg = '❌ Invalid email or password. Please try again.';
        } else if (role === 'admin' && backendMsg.toLowerCase().includes('code')) {
          errorMsg = '❌ Invalid admin code. Please check and try again.';
        } else {
          errorMsg = '❌ ' + backendMsg;
        }
      } else if (error.response?.status === 404) {
        errorMsg = '❌ Account not found. Please sign up first.';
      } else if (error.response?.status === 403) {
        errorMsg = '❌ Access denied. Please contact support.';
      } else if (error.response?.data?.message) {
        errorMsg = '❌ ' + error.response.data.message;
      }
      
      toast.error(errorMsg, {
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          fontWeight: '600'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    
    try {
      if (provider === 'Google') {
        console.log('🔵 Starting Google popup login...');
        
        // Call the popup-style Google OAuth
        const result = await signInWithGoogle('PPSU');
        
        if (!result?.session?.provider_token) {
          throw new Error('Google provider token not returned from Supabase.');
        }

        console.log('✅ Google OAuth successful, authenticating with backend...');

        // Send the provider token to your backend
        const response = await apiClient.post('/auth/google', {
          accessToken: result.session.provider_token,
          institutionCode: result.institutionCode || 'PPSU'
        });

        if (response.data.success) {
          const userData = response.data.data.user;
          const token = response.data.data.token;

          setToken(token);
          setUser(userData);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          toast.success(`Welcome, ${userData.firstName}!`);

          const role = userData.role?.toLowerCase();
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'faculty') {
            navigate('/faculty/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        } else {
          toast.error(response.data.message || 'Google login failed.');
        }
      } else if (provider === 'Microsoft') {
        toast.info('Microsoft login coming soon');
      }
    } catch (error) {
      console.error('Social login error:', error);
      
      // Show detailed error message
      let errorMessage = `${provider} login failed. Please try again.`;
      
      if (error.message === 'Popup was blocked. Please allow popups for this site.') {
        errorMessage = '❌ Popup blocked! Please allow popups and try again.';
      } else if (error.message === 'Google sign-in was cancelled') {
        errorMessage = 'Google sign-in was cancelled';
        // Don't show error toast for user-initiated cancellation
        setLoading(false);
        return;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email, role) => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.post('/auth/verify-email', { 
        email,
        role
      });

      if (response.data.success && response.data.data.exists) {
        toast.success('✓ Password reset link sent to your email!');
        // In future: navigate to password reset page or show reset form
      } else {
        toast.error('❌ Email not registered. Please sign up first.');
      }
    } catch (error) {
      console.error('Verify email error:', error);
      
      if (error.response?.status === 404 || !error.response?.data?.data?.exists) {
        toast.error('❌ This email is not registered. Please sign up first.');
      } else if (error.response?.status === 401) {
        toast.error(`❌ This email is not registered as a ${role}. Please check your role.`);
      } else {
        toast.error(error.response?.data?.message || 'Unable to verify email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-teal-50 to-green-50">
      {/* Navbar */}
      <AuthNavbar />
      
      {/* Main Content */}
      <motion.section 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 relative overflow-hidden flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6"
      >
        {/* Background Blur Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-green-300 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-16 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10 w-full flex items-center justify-center">
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-full sm:max-w-[95%] md:max-w-4xl lg:max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-green-100 sm:border-2"
        >
          <div className="flex flex-col md:flex-row min-h-[auto] md:min-h-[500px] lg:min-h-[550px]">
            
            {/* Left Side - Welcome Section */}
            <motion.div 
              variants={slideInLeft}
              className="md:w-5/12 bg-gradient-to-br from-green-600 via-teal-600 to-green-700 p-5 sm:p-6 md:p-7 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden"
            >
              
              {/* Decorative Blurs */}
              <div className="absolute -top-20 -left-20 w-48 h-48 md:w-64 md:h-64 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-20 -right-20 w-48 h-48 md:w-64 md:h-64 bg-lime-400 rounded-full blur-3xl opacity-20"></div>
              
              <div className="relative z-10">
                {/* Logo */}
                <Reveal delay={0.05}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight">Proctolearn</h1>
                      <p className="text-[10px] sm:text-xs text-green-100 uppercase tracking-wider font-semibold">Online Proctoring System</p>
                    </div>
                  </div>
                </Reveal>

                {/* Welcome Text */}
                <Reveal delay={0.1}>
                  <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 leading-tight">Welcome back</h2>
                    <p className="text-green-100 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                      Secure access for Students, Faculty, and Administrators to manage quizzes and track exam sessions with AI-powered proctoring.
                    </p>
                  </div>
                </Reveal>

                {/* Image with better alignment */}
                <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 mb-3 sm:mb-4 hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-600/80 to-transparent rounded-2xl z-10"></div>
                  <MotionImage
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=250&fit=crop&auto=format" 
                    alt="Online Learning" 
                    className="rounded-2xl w-full h-full object-cover shadow-lg border-4 border-white/20"
                    hoverScale={1.03}
                  />
                  <Reveal className="absolute bottom-4 left-4 right-4 z-20 text-white" delay={0.12}>
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span className="text-sm font-bold">Trusted by 5,000+ Students</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                        AI Proctoring
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                        100% Secure
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 mt-auto pt-4 sm:pt-5 md:pt-6 border-t border-white/20">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-green-200 flex-wrap">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                    <span>Secure</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-green-300"></div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm6 10c0 .55-.45 1-1 1s-1-.45-1-1-.45-1-1-1-1 .45-1 1-.45 1-1 1-1-.45-1-1 .45-1 1-1 1 .45 1 1z" />
                    </svg>
                    <span>Encrypted</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-green-300"></div>
                  <span>© 2025 Proctolearn</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Login Forms */}
            <motion.div 
              variants={slideInRight}
              className="md:w-7/12 bg-gradient-to-br from-white to-green-50/30 p-5 sm:p-6 md:p-7 lg:p-10 flex flex-col justify-center"
            >
              
              {/* Tabs */}
              <Reveal delay={0.05}>
                <motion.div 
                  ref={tabsRef}
                  variants={itemVariants}
                  className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-5 md:mb-6 justify-center md:justify-start"
                  role="tablist"
                  aria-label="Login type selection"
                >
                  <button
                    onClick={() => {
                      setActiveTab('student');
                    }}
                    onKeyDown={handleTabKeyDown}
                    role="tab"
                    aria-selected={activeTab === 'student'}
                    aria-controls="student-panel"
                    tabIndex={activeTab === 'student' ? 0 : -1}
                    className={`cursor-pointer transition-all duration-300 font-bold flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base transform hover:scale-105 active:scale-95 relative group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                      activeTab === 'student'
                        ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/50'
                        : 'bg-white text-slate-600 hover:bg-teal-50 border border-teal-200 sm:border-2 hover:border-teal-400'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span>Student</span>
                    {activeTab !== 'student' && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-teal-600 group-hover:w-3/4 transition-all duration-300 ease-out"></span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('faculty');
                    }}
                    onKeyDown={handleTabKeyDown}
                    role="tab"
                    aria-selected={activeTab === 'faculty'}
                    aria-controls="faculty-panel"
                    tabIndex={activeTab === 'faculty' ? 0 : -1}
                    className={`cursor-pointer transition-all duration-300 font-bold flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base transform hover:scale-105 active:scale-95 relative group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      activeTab === 'faculty'
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-white text-slate-600 hover:bg-green-50 border border-green-200 sm:border-2 hover:border-green-400'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                    </svg>
                    <span>Faculty</span>
                    {activeTab !== 'faculty' && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-600 group-hover:w-3/4 transition-all duration-300 ease-out"></span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                    }}
                    onKeyDown={handleTabKeyDown}
                    role="tab"
                    aria-selected={activeTab === 'admin'}
                    aria-controls="admin-panel"
                    tabIndex={activeTab === 'admin' ? 0 : -1}
                    className={`cursor-pointer transition-all duration-300 font-bold flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base transform hover:scale-105 active:scale-95 relative group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      activeTab === 'admin'
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg shadow-green-500/50'
                        : 'bg-white text-slate-600 hover:bg-green-50 border border-green-200 sm:border-2 hover:border-green-400'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                    <span>Admin</span>
                    {activeTab !== 'admin' && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-600 group-hover:w-3/4 transition-all duration-300 ease-out"></span>
                    )}
                  </button>
                </motion.div>
              </Reveal>

              {/* STUDENT LOGIN FORM */}
              {activeTab === 'student' && (
                <motion.div 
                  id="student-panel"
                  role="tabpanel"
                  aria-labelledby="student-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Reveal>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Student Login</h3>
                  
                  {/* Social Login */}
                  <div className="mb-3 sm:mb-4">
                    <button
                      onClick={() => handleSocialLogin('Google')}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 border border-teal-200 sm:border-2 rounded-lg sm:rounded-xl hover:bg-teal-50 transition-all transform hover:scale-[1.02] active:scale-95 text-xs sm:text-sm md:text-base font-semibold text-slate-700 hover:border-teal-400 hover:shadow-lg disabled:opacity-50"
                    >
                      <MotionImage
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        alt="Google"
                        hoverScale={1}
                      />
                      <span className="hidden sm:inline">Continue with Google</span>
                      <span className="sm:hidden">Google Login</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center mb-2.5 sm:mb-3">
                    <div className="flex-grow border-t border-teal-200"></div>
                    <span className="flex-shrink mx-2 sm:mx-3 text-slate-400 text-[10px] sm:text-xs font-semibold">OR LOGIN WITH EMAIL</span>
                    <div className="flex-grow border-t border-teal-200"></div>
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={(e) => handleSubmit(e, 'student')}>
                    <div className="mb-2.5 sm:mb-3">
                      <label htmlFor="studentEmail" className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase mb-1.5 sm:mb-2">Email Address<span className="text-rose-500 ml-1">*</span></label>
                      <div className="relative">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <input 
                          id="studentEmail"
                          name="studentEmail"
                          type="email" 
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-teal-200 sm:border-2 rounded-lg sm:rounded-xl outline-none focus:border-teal-500 transition font-medium text-sm sm:text-base"
                          placeholder="student@proctolearn.edu"
                          value={formData.studentEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <label htmlFor="studentPassword" className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase">Password<span className="text-rose-500 ml-1">*</span></label>
                        <button 
                          type="button"
                          onClick={() => handleForgotPassword(formData.studentEmail, 'student')}
                          disabled={loading}
                          className="text-[10px] sm:text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline disabled:opacity-50"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm6 10c0 .55-.45 1-1 1s-1-.45-1-1-.45-1-1-1-1 .45-1 1-.45 1-1 1-1-.45-1-1 .45-1 1-1 1 .45 1 1z" />
                        </svg>
                        <input 
                          id="studentPassword"
                          name="studentPassword"
                          type="password" 
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-teal-200 sm:border-2 rounded-lg sm:rounded-xl outline-none focus:border-teal-500 transition font-medium text-sm sm:text-base"
                          value={formData.studentPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-teal-700 to-teal-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-teal-800 hover:to-teal-600 transition shadow-lg shadow-teal-700/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      Student Login
                    </button>
                  </form>

                  <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-slate-400 text-center">
                    By continuing you agree to our <a href="#" className="text-teal-600 hover:underline">Terms & Privacy Policy</a>
                  </p>

                  <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-500 text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-teal-600 hover:text-teal-700 font-bold hover:underline">
                      Sign Up Here
                    </Link>
                  </p>
                </Reveal>
                </motion.div>
              )}

              {/* FACULTY LOGIN FORM */}
              {activeTab === 'faculty' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="animate-fadeIn"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Faculty Login</h3>
                  
                  {/* Social Login */}
                  <div className="mb-3 sm:mb-4">
                    <button
                      onClick={() => handleSocialLogin('Google')}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 border border-green-200 sm:border-2 rounded-lg sm:rounded-xl hover:bg-green-50 transition-all transform hover:scale-[1.02] active:scale-95 text-xs sm:text-sm md:text-base font-semibold text-slate-700 hover:border-green-400 hover:shadow-lg disabled:opacity-50"
                    >
                      <MotionImage
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        alt="Google"
                        hoverScale={1}
                      />
                      <span className="hidden sm:inline">Continue with Google</span>
                      <span className="sm:hidden">Google Login</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center mb-2.5 sm:mb-3">
                    <div className="flex-grow border-t border-green-200"></div>
                    <span className="flex-shrink mx-2 sm:mx-3 text-slate-400 text-[10px] sm:text-xs font-semibold">OR LOGIN WITH EMAIL</span>
                    <div className="flex-grow border-t border-green-200"></div>
                  </div>

                  <form onSubmit={(e) => handleSubmit(e, 'faculty')}>
                    <div className="mb-2.5 sm:mb-3">
                      <label htmlFor="facultyEmail" className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase mb-1.5 sm:mb-2">Faculty Email<span className="text-rose-500 ml-1">*</span></label>
                      <div className="relative">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <input 
                          id="facultyEmail"
                          name="facultyEmail"
                          type="email" 
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-green-200 sm:border-2 rounded-lg sm:rounded-xl outline-none focus:border-green-500 transition font-medium text-sm sm:text-base" 
                          placeholder="faculty@proctolearn.edu"
                          value={formData.facultyEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <label htmlFor="facultyPassword" className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase">Password<span className="text-rose-500 ml-1">*</span></label>
                        <button 
                          type="button"
                          onClick={() => handleForgotPassword(formData.facultyEmail, 'faculty')}
                          disabled={loading}
                          className="text-[10px] sm:text-xs text-green-600 hover:text-green-700 font-semibold hover:underline disabled:opacity-50"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm6 10c0 .55-.45 1-1 1s-1-.45-1-1-.45-1-1-1-1 .45-1 1-.45 1-1 1-1-.45-1-1 .45-1 1-1 1 .45 1 1z" />
                        </svg>
                        <input 
                          id="facultyPassword"
                          name="facultyPassword"
                          type="password" 
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-green-200 sm:border-2 rounded-lg sm:rounded-xl outline-none focus:border-green-500 transition font-medium text-sm sm:text-base" 
                          value={formData.facultyPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-700 to-teal-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-green-800 hover:to-teal-700 transition shadow-lg shadow-green-700/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      Faculty Login
                    </button>
                  </form>

                  <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-slate-400 text-center">
                    By continuing you agree to our <a href="#" className="text-green-600 hover:underline">Terms & Privacy Policy</a>
                  </p>

                  <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-500 text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-600 hover:text-green-700 font-bold hover:underline">
                      Sign Up Here
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* ADMIN LOGIN FORM */}
              {activeTab === 'admin' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="animate-fadeIn"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Admin Login</h3>

                  <form onSubmit={(e) => handleSubmit(e, 'admin')}>
                    <div className="mb-2.5 sm:mb-3">
                      <label htmlFor="adminEmail" className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase mb-1.5 sm:mb-2">Admin Email<span className="text-green-600 ml-1">*</span></label>
                      <div className="relative">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <input 
                          id="adminEmail"
                          name="adminEmail"
                          type="email" 
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-green-200 sm:border-2 rounded-lg sm:rounded-xl outline-none focus:border-green-500 transition font-medium text-sm sm:text-base" 
                          placeholder="admin@proctolearn.edu"
                          value={formData.adminEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-2.5 sm:mb-3">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <label htmlFor="adminPassword" className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase">Password<span className="text-green-600 ml-1">*</span></label>
                        <button 
                          type="button"
                          onClick={() => handleForgotPassword(formData.adminEmail, 'admin')}
                          disabled={loading}
                          className="text-[10px] sm:text-xs text-green-600 hover:text-green-700 font-semibold hover:underline disabled:opacity-50"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm6 10c0 .55-.45 1-1 1s-1-.45-1-1-.45-1-1-1-1 .45-1 1-.45 1-1 1-1-.45-1-1 .45-1 1-1 1 .45 1 1z" />
                        </svg>
                        <input 
                          id="adminPassword"
                          name="adminPassword"
                          type="password" 
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-green-200 sm:border-2 rounded-lg sm:rounded-xl outline-none focus:border-green-500 transition font-medium text-sm sm:text-base" 
                          value={formData.adminPassword}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3 sm:mb-4">
                      <label htmlFor="adminCode" className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase mb-1.5 sm:mb-2">Admin Code<span className="text-green-600 ml-1">*</span></label>
                      <div className="relative">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        <input 
                          id="adminCode"
                          name="adminCode"
                          type="password" 
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-green-200 sm:border-2 rounded-lg sm:rounded-xl outline-none focus:border-green-500 transition font-medium text-sm sm:text-base" 
                          placeholder="Secure admin access code"
                          value={formData.adminCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-green-800 hover:to-green-600 transition shadow-lg shadow-green-700/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      Admin Login
                    </button>
                  </form>

                  <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-slate-400 text-center">
                    By continuing you agree to our <a href="#" className="text-green-600 hover:underline">Terms & Privacy Policy</a>
                  </p>

                  <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-500 text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-600 hover:text-green-700 font-bold hover:underline">
                      Sign Up Here
                    </Link>
                  </p>
                </motion.div>
              )}

            </motion.div>
          </div>
        </motion.div>
        </div>

        {/* Animated Loading Overlay */}
        <AnimatePresence>
          {loading && <AuthLoader message="Verifying..." />}
        </AnimatePresence>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
        `}</style>
      </motion.section>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
