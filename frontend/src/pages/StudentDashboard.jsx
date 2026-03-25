import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Award,
  Target,
  CheckCircle,
  Calendar,
  Menu,
  BarChart3,
  User,
  Settings,
  UserCheck,
  Play,
  X,
  CheckCircle2,
  XCircle,
  Plus,
  Mail,
  Phone,
  Pencil,
  Save
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuthStore } from '../context/store';
import DashboardSidebar from '../components/Layout/DashboardSidebar';
import { getMyQuizzes } from '../services/myQuizService';
import { getAllQuizzes } from '../services/quizService';
import api from '../services/api';
import socket from '../socket';
import '../styles/dashboards.css';
import '../styles/dark-mode.css';
import '../styles/mobile-buttons.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Simplified animation variants - only for initial page load
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const StudentDashboard = () => {
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [myQuizzesLoading, setMyQuizzesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const mainContentRef = useRef(null);
  const sectionRefs = useRef({});
  const profileImageInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    profilePicture: ''
  });
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [emailToggleSaving, setEmailToggleSaving] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [requestPdfFile, setRequestPdfFile] = useState(null);
  const [requestFormData, setRequestFormData] = useState({
    reason: '',
    qualifications: ''
  });
  const [stats, setStats] = useState({
    completedQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    upcoming: 0
  });

  // Student sidebar navigation items
  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', id: 'dashboard' },
    { icon: BookOpen, label: 'Available Quizzes', id: 'quizzes' },
    { icon: Award, label: 'My Results', id: 'results' },
    { icon: Target, label: 'Progress', id: 'progress' },
    { icon: UserCheck, label: 'Request Faculty Role', id: 'request-faculty' },
    { icon: User, label: 'Profile', id: 'profile' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ];

  useEffect(() => {
    if (user?.facultyRequest) {
      setExistingRequest(user.facultyRequest);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      bio: user.bio || '',
      profilePicture: user.profilePicture || ''
    });
  }, [user]);

  const getSubmissionPercent = (submission) => {
    if (typeof submission?.percentage === 'number') return Math.round(submission.percentage);
    const score = submission?.score ?? submission?.totalMarksObtained;
    const total = submission?.totalMarks;
    if (typeof score === 'number' && typeof total === 'number' && total > 0) {
      return Math.round((score / total) * 100);
    }
    return null;
  };

  // Real data chart: average score by subject
  const performanceData = useMemo(() => {
    const buckets = {};

    (myQuizzes || []).forEach((submission) => {
      const subject = submission?.quiz?.subject || 'General';
      const percent = getSubmissionPercent(submission);
      if (percent === null) return;

      if (!buckets[subject]) buckets[subject] = [];
      buckets[subject].push(percent);
    });

    const labels = Object.keys(buckets);
    const values = labels.map((subject) => {
      const arr = buckets[subject];
      return Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length);
    });

    const palette = [
      'rgba(16, 185, 129, 0.85)',
      'rgba(59, 130, 246, 0.85)',
      'rgba(139, 92, 246, 0.85)',
      'rgba(249, 115, 22, 0.85)',
      'rgba(236, 72, 153, 0.85)',
      'rgba(14, 165, 233, 0.85)'
    ];

    const fallback = labels.length === 0;
    const finalLabels = fallback ? ['No Attempts Yet'] : labels;
    const finalValues = fallback ? [0] : values;

    return {
      labels: finalLabels,
      datasets: [{
        label: 'Average Score (%)',
        data: finalValues,
        backgroundColor: finalLabels.map((_, i) => palette[i % palette.length]),
        borderColor: finalLabels.map((_, i) => palette[i % palette.length].replace('0.85', '1')),
        borderWidth: 2,
        borderRadius: 12,
        maxBarThickness: 56,
      }]
    };
  }, [myQuizzes]);

  // Real data chart: completion overview
  const completionData = useMemo(() => {
    const completed = (myQuizzes || []).filter((s) => ['submitted', 'graded'].includes(s.status)).length;
    const inProgress = (myQuizzes || []).filter((s) => s.status === 'in_progress').length;
    const attemptedQuizIds = new Set((myQuizzes || []).map((s) => s.quiz?._id).filter(Boolean));
    const notStarted = Math.max((quizzes || []).length - attemptedQuizIds.size, 0);

    return {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [{
        data: [completed, inProgress, notStarted],
        backgroundColor: [
          'rgba(34, 197, 94, 0.85)',
          'rgba(251, 146, 60, 0.85)',
          'rgba(156, 163, 175, 0.85)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      }]
    };
  }, [myQuizzes, quizzes]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: 'rgba(0, 0, 0, 0.6)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(0, 0, 0, 0.6)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgba(0, 0, 0, 0.7)',
        }
      }
    },
    cutout: '60%',
  };
  
  const achievements = [
    { label: 'First Quiz', emoji: '🎉', locked: false },
    { label: 'Streak', emoji: '🔥', locked: true },
    { label: 'Perfect Score', emoji: '🏆', locked: true }
  ];
  
  const scrollToSection = (sectionId) => {
    const targetSection = sectionRefs.current[sectionId];
    const mainArea = mainContentRef.current;
    if (!targetSection || !mainArea) return;

    mainArea.scrollTo({
      top: targetSection.offsetTop - 16,
      behavior: 'smooth'
    });
  };

  const openProfileModal = () => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      bio: user.bio || '',
      profilePicture: user.profilePicture || ''
    });
    setProfileEditMode(false);
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setProfileEditMode(false);
  };

  const onProfileFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onProfileImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, profilePicture: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const onProfileSave = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    try {
      setProfileSaving(true);
      const payload = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        bio: profileForm.bio.trim(),
        profilePicture: profileForm.profilePicture
      };

      const response = await api.patch('/auth/profile', payload);
      if (response?.data?.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
        setProfileEditMode(false);
      } else {
        toast.error(response?.data?.message || 'Unable to update profile');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const onProfileCancelEdit = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      profilePicture: user?.profilePicture || ''
    });
    setProfileEditMode(false);
  };

  const handleNavigation = (item) => {
    setActiveSidebarItem(item.id);

    if (item.id === 'request-faculty') {
      if (user?.role !== 'student') {
        toast.error('Only students can request faculty role');
      } else {
        setRequestModalOpen(true);
      }
      setSidebarOpen(false);
      return;
    }

    if (item.id === 'profile') {
      openProfileModal();
      setSidebarOpen(false);
      return;
    }

    scrollToSection(item.id);
    setSidebarOpen(false);
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (user?.role !== 'student') {
      toast.error('Only students can request faculty role');
      return;
    }

    if (!requestFormData.reason.trim() || !requestFormData.qualifications.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setRequestSubmitting(true);
      const payload = new FormData();
      payload.append('reason', requestFormData.reason);
      payload.append('qualifications', requestFormData.qualifications);
      if (requestPdfFile) {
        payload.append('facultyRequestPdf', requestPdfFile);
      }

      const response = await api.post('/auth/request-faculty', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response?.data?.success) {
        setExistingRequest(response.data.data);
        setRequestFormData({ reason: '', qualifications: '' });
        setRequestPdfFile(null);
        toast.success('Faculty role request submitted successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handlePdfSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Only PDF files are allowed');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be 5MB or less');
      e.target.value = '';
      return;
    }

    setRequestPdfFile(file);
  };

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const institutionId = typeof user.institution === 'string'
      ? user.institution
      : user.institution?._id;

    socket.emit('join-student-dashboard', {
      studentId: user._id,
      institutionId
    });

    const onQuizPublished = (payload) => {
      const subjectText = payload?.subject ? ` (${payload.subject})` : '';
      toast.success(`New quiz published: ${payload?.title || 'Quiz'}${subjectText}`);
      setRefreshCounter((prev) => prev + 1);
    };

    socket.on('quiz-published-notification', onQuizPublished);

    return () => {
      socket.off('quiz-published-notification', onQuizPublished);
    };
  }, [user]);

  const handleEmailNotificationsToggle = async () => {
    if (!user) return;

    const currentValue = user?.preferences?.emailNotifications !== false;
    const nextValue = !currentValue;

    try {
      setEmailToggleSaving(true);
      const response = await api.patch('/auth/profile', {
        preferences: {
          emailNotifications: nextValue
        }
      });

      if (response?.data?.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success(nextValue ? 'Email updates enabled' : 'Email updates disabled');
      } else {
        toast.error(response?.data?.message || 'Failed to update notification settings');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update notification settings');
    } finally {
      setEmailToggleSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async (initialLoad = false) => {
      try {
        if (initialLoad) {
          setLoading(true);
          setMyQuizzesLoading(true);
        }

        const [quizResponse, submissionResponse] = await Promise.all([
          getAllQuizzes({ status: 'published' }),
          getMyQuizzes()
        ]);

        // Fetch published quizzes
        if (quizResponse?.success) {
          const allQuizzes = quizResponse.data || [];
          console.log('✅ Quizzes fetched:', allQuizzes.length, allQuizzes);
          
          // Filter for available quizzes (published and within access window if set)
          const availableQuizzes = allQuizzes.filter(quiz => {
            if (quiz.status !== 'published') return false;
            
            // Debug: Log quiz structure
            if (!quiz._id) {
              console.error('❌ CRITICAL: Quiz missing _id! Quiz object:', quiz);
              console.error('   Quiz keys:', Object.keys(quiz));
              return false;  // Filter out quizzes without _id
            }
            
            // Check access window if it exists
            if (quiz.accessWindow) {
              const now = new Date();
              if (quiz.accessWindow.startDate && new Date(quiz.accessWindow.startDate) > now) {
                console.log(`Quiz ${quiz.title} not started yet`);
                return false; // Quiz hasn't started yet
              }
              if (quiz.accessWindow.endDate && new Date(quiz.accessWindow.endDate) < now) {
                console.log(`Quiz ${quiz.title} has ended`);
                return false; // Quiz has ended
              }
            }
            
            return true;
          });
          
          console.log('✅ Available quizzes:', availableQuizzes.length, availableQuizzes);
          setQuizzes(availableQuizzes || []);

          const submissions = submissionResponse?.success ? (submissionResponse.data || []) : [];
          setMyQuizzes(submissions);

          const completedQuizzes = submissions.filter((s) => ['submitted', 'graded'].includes(s.status)).length;
          const scored = submissions
            .map((s) => getSubmissionPercent(s))
            .filter((v) => typeof v === 'number');
          const averageScore = scored.length > 0
            ? Math.round(scored.reduce((sum, v) => sum + v, 0) / scored.length)
            : 0;
          const upcoming = availableQuizzes.filter((quiz) => {
            const startDate = quiz?.accessWindow?.startDate;
            return startDate ? new Date(startDate) > new Date() : false;
          }).length;

          setStats({
            completedQuizzes,
            totalAttempts: submissions.length,
            averageScore,
            upcoming
          });
        } else {
          console.warn('Failed to fetch quizzes:', quizResponse?.message);
          setQuizzes([]);
        }

        setLastUpdated(new Date());
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setQuizzes([]);
        setMyQuizzes([]);
      } finally {
        if (initialLoad) {
          setLoading(false);
          setMyQuizzesLoading(false);
        }
      }
    };

    if (user) {
      fetchData(true);
      const interval = setInterval(() => fetchData(false), 20000);
      return () => clearInterval(interval);
    }
  }, [user, refreshCounter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            PL
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Proctolearn</h1>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">Student</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={24} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem={activeSidebarItem}
          onNavigate={handleNavigation}
          customItems={sidebarItems}
        />

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            
            {/* Welcome Section */}
            <motion.div
              ref={(el) => { sectionRefs.current.dashboard = el; }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-teal-400 to-green-600 text-white p-6 lg:p-8 shadow-xl">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10">
                  <p className="text-base font-semibold opacity-90 mb-2">📚 Welcome back!</p>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    Hey {user?.firstName || 'Student'}! 🎓
                  </h1>
                  <p className="text-sm lg:text-base opacity-95 max-w-2xl">
                    Ready to continue your learning journey? Let's see how you're progressing!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {[
                { title: 'Completed', value: stats.completedQuizzes ?? 0, icon: CheckCircle, color: 'green', change: '+Live' },
                { title: 'Total Attempts', value: stats.totalAttempts ?? 0, icon: Target, color: 'blue', change: '+Live' },
                { title: 'Avg. Score', value: `${stats.averageScore ?? 0}%`, icon: Award, color: 'purple', change: '+Live' },
                { title: 'Upcoming', value: stats.upcoming ?? 0, icon: Calendar, color: 'orange', change: '+Live' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="group cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${
                    stat.color === 'green' ? 'from-green-500 to-green-600' :
                    stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    'from-orange-500 to-orange-600'
                  } p-6 lg:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden transform transition-all duration-300 group-hover:scale-105`}>
                    
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/20" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <stat.icon size={20} />
                        </div>
                        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {stat.change}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm opacity-90">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div
              ref={(el) => { sectionRefs.current.progress = el; }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 mb-8"
            >
              
              {/* Performance Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-1">Subject Performance</h3>
                    <p className="text-sm text-slate-600">Live scores across subjects {lastUpdated ? `· updated ${lastUpdated.toLocaleTimeString()}` : ''}</p>
                  </div>
                </div>
                <div className="h-64 lg:h-80">
                  <Bar data={performanceData} options={chartOptions} />
                </div>
              </motion.div>

              {/* Completion Status Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-1">Quiz Status</h3>
                    <p className="text-sm text-slate-600">Real-time completion overview</p>
                  </div>
                </div>
                <div className="h-64 lg:h-80">
                  <Doughnut data={completionData} options={doughnutOptions} />
                </div>
              </motion.div>
            </div>

            {/* Available Quizzes Section */}
            <motion.div
              ref={(el) => { sectionRefs.current.quizzes = el; }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">Available Quizzes</h2>
                  <p className="text-sm text-slate-600">Ready to test your knowledge?</p>
                </div>
                <button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => navigate('/available-quizzes')}
                >
                  View All
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/50 p-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium mb-2">No quizzes available at the moment</p>
                  <p className="text-sm text-slate-500">Check back later or contact your faculty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {quizzes.map((quiz, idx) => (
                    <motion.div
                      key={quiz._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-5 lg:p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border border-slate-200/50 group h-full flex flex-col"
                      onClick={() => {
                        console.log('🎯 Quiz card clicked. Quiz object:', quiz);
                        console.log('   - quiz._id:', quiz._id);
                        console.log('   - quiz.id:', quiz.id);
                        console.log('   - quiz title:', quiz.title);
                        console.log('   - Navigating to /quiz/' + quiz._id);
                        navigate(`/quiz/${quiz._id}`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 text-sm lg:text-base">
                              {quiz.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                      
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 mb-3 w-fit">
                        ✓ Available Now
                      </span>
                      
                      {quiz.description && (
                        <p className="text-xs lg:text-sm text-slate-600 mb-3 line-clamp-2 flex-grow">
                          {quiz.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-slate-500" /> 
                          <span className="font-semibold">{quiz.duration}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 lg:w-4 lg:h-4 text-slate-500" /> 
                          <span className="font-semibold">{quiz.totalMarks || 0}</span>
                        </div>
                      </div>
                      
                      {(quiz.subject || quiz.chapter) && (
                        <div className="flex flex-wrap gap-1 text-xs mb-3">
                          {quiz.subject && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {quiz.subject}
                            </span>
                          )}
                          {quiz.chapter && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                              {quiz.chapter}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <button
                        className="mt-auto w-full py-2 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('▶️ START button clicked. Quiz object:', quiz);
                          console.log('   - quiz._id:', quiz._id);
                          console.log('   - quiz.id:', quiz.id);
                          console.log('   - All quiz keys:', Object.keys(quiz));
                          
                          if (!quiz._id && !quiz.id) {
                            console.error('❌ ERROR: Quiz has no _id or id field!');
                            toast.error('Quiz ID is missing. Cannot start quiz.');
                            return;
                          }
                          
                          const quizId = quiz._id || quiz.id;
                          navigate(`/quiz/${quizId}`);
                        }}
                      >
                        <Play size={16} className="inline mr-1" />
                        Start
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* My Quiz History */}
            <motion.div
              ref={(el) => { sectionRefs.current.results = el; }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50"
              id="my-quizzes-section"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-1">My Quiz History</h3>
                  <p className="text-sm text-slate-600">Your recent quiz attempts</p>
                </div>
                <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors">
                  View all
                </button>
              </div>
              
              {myQuizzesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : myQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-2">No quiz attempts yet</p>
                  <p className="text-sm text-slate-400">Start taking quizzes to see your progress here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myQuizzes.slice(0, 5).map((submission) => (
                    <div
                      key={submission._id}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        (submission.score || submission.totalMarksObtained || 0) >= 80 
                          ? 'bg-green-100 text-green-600' 
                          : (submission.score || submission.totalMarksObtained || 0) >= 60 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-red-100 text-red-600'
                      }`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{submission.quiz?.title || 'Untitled Quiz'}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            (submission.score || submission.totalMarksObtained || 0) >= 80 
                              ? 'bg-green-100 text-green-600' 
                              : (submission.score || submission.totalMarksObtained || 0) >= 60 
                                ? 'bg-orange-100 text-orange-600' 
                                : 'bg-red-100 text-red-600'
                          }`}>
                            Score: {submission.score ?? submission.totalMarksObtained ?? 0}/{submission.totalMarks ?? 0}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          (submission.score || submission.totalMarksObtained || 0) >= 80 
                            ? 'text-green-600' 
                            : (submission.score || submission.totalMarksObtained || 0) >= 60 
                              ? 'text-orange-600' 
                              : 'text-red-600'
                        }`}>
                          {Math.round(((submission.score || submission.totalMarksObtained || 0) / (submission.totalMarks || 1)) * 100)}%
                        </div>
                        <div className="text-xs text-slate-500">{submission.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Settings Section */}
            <motion.div
              ref={(el) => { sectionRefs.current.settings = el; }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-8 bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800">Settings</h3>
                  <p className="text-sm text-slate-600">Account preferences (live user data)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-500 mb-1">Notifications</p>
                  <p className="font-semibold text-slate-800">
                    {user?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-slate-500 mb-1">Email Updates</p>
                      <p className="font-semibold text-slate-800">
                        {user?.preferences?.emailNotifications !== false ? 'Enabled' : 'Disabled'}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Receive quiz and platform email updates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleEmailNotificationsToggle}
                      disabled={emailToggleSaving}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                        user?.preferences?.emailNotifications !== false ? 'bg-emerald-500' : 'bg-slate-300'
                      } ${emailToggleSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                      aria-label="Toggle email notifications"
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          user?.preferences?.emailNotifications !== false ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </main>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[90]"
              onClick={closeProfileModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[95] p-4 lg:p-8 flex items-start justify-center overflow-auto"
            >
              <div className="w-full max-w-5xl py-2">
                <div className="text-center mb-4 rounded-2xl bg-white/95 border border-slate-200 shadow-sm py-4 px-3">
                  <h2 className="text-4xl font-extrabold text-slate-900">My Profile</h2>
                  <p className="text-slate-700 font-medium mt-2">View and update your information</p>
                </div>

                <div className="relative rounded-2xl bg-white border border-emerald-100 shadow-[0_18px_40px_rgba(2,132,199,0.08)] p-6 lg:p-10">
                  <button
                    type="button"
                    aria-label="Close profile popup"
                    onClick={closeProfileModal}
                    className="absolute right-6 top-6 w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>

                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onProfileImageSelect}
                  />

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                    <div className="flex items-start gap-5">
                      <div className="relative">
                        <img
                          src={profileForm.profilePicture || 'https://ui-avatars.com/api/?name=Student&background=22c55e&color=fff'}
                          alt="Profile"
                          className="w-36 h-36 rounded-full object-cover border-4 border-emerald-200"
                        />
                        {profileEditMode && (
                          <button
                            type="button"
                            onClick={() => profileImageInputRef.current?.click()}
                            className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600"
                            title="Change profile photo"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>

                      <div>
                        <h3 className="text-5xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                          {(profileForm.firstName || user?.firstName || '').toUpperCase()} {(profileForm.lastName || user?.lastName || '').toUpperCase()}
                        </h3>
                        <span className="inline-flex mt-3 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-2xl lg:text-xl">
                          {user?.role === 'student' ? 'Student' : 'Faculty Member'}
                        </span>

                        <div className="mt-6 flex items-center gap-2 text-slate-500 text-2xl lg:text-xl break-all">
                          <Mail size={20} className="text-emerald-600" />
                          <span>{user?.email || 'No email'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {!profileEditMode ? (
                        <button
                          type="button"
                          onClick={() => setProfileEditMode(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold shadow-[0_10px_24px_rgba(34,197,94,0.35)] hover:from-emerald-600 hover:to-lime-600"
                        >
                          <Pencil size={18} />
                          Edit Profile
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onProfileCancelEdit}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold shadow-[0_10px_24px_rgba(34,197,94,0.35)] hover:from-emerald-600 hover:to-lime-600"
                        >
                          <X size={18} />
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {!profileEditMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6">
                        <p className="text-emerald-700 font-semibold mb-2">Full Name</p>
                        <p className="text-3xl lg:text-2xl font-extrabold text-slate-900">
                          {`${profileForm.firstName || user?.firstName || ''} ${profileForm.lastName || user?.lastName || ''}`.trim() || 'N/A'}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6">
                        <p className="text-emerald-700 font-semibold mb-2 flex items-center gap-2">
                          <Phone size={16} />
                          Phone
                        </p>
                        <p className="text-3xl lg:text-2xl font-extrabold text-slate-900">{profileForm.phone || 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">First Name</label>
                          <input
                            name="firstName"
                            value={profileForm.firstName}
                            onChange={onProfileFieldChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Last Name</label>
                          <input
                            name="lastName"
                            value={profileForm.lastName}
                            onChange={onProfileFieldChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Phone</label>
                        <input
                          name="phone"
                          value={profileForm.phone}
                          onChange={onProfileFieldChange}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Bio (Optional)</label>
                        <textarea
                          name="bio"
                          rows={3}
                          value={profileForm.bio}
                          onChange={onProfileFieldChange}
                          placeholder="Tell us about yourself..."
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex flex-col md:flex-row gap-3">
                        <button
                          type="button"
                          onClick={onProfileSave}
                          disabled={profileSaving}
                          className="flex-1 rounded-xl py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold hover:from-emerald-600 hover:to-lime-600 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          <Save size={16} />
                          {profileSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={onProfileCancelEdit}
                          className="flex-1 rounded-xl py-3 bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Request Faculty Role Modal */}
      <AnimatePresence>
        {requestModalOpen && user?.role === 'student' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[90]"
              onClick={() => setRequestModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[95] p-4 lg:p-8 flex items-center justify-center"
            >
              <div className="w-full max-w-2xl max-h-[88vh] overflow-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Request Faculty Role</h2>
                      <p className="text-sm text-slate-500">Submit your request for admin approval</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close faculty request popup"
                    onClick={() => setRequestModalOpen(false)}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {existingRequest && existingRequest.status !== 'none' && (
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-semibold text-slate-900">Current Request Status</h3>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border ${getRequestStatusColor(existingRequest.status)}`}>
                          {existingRequest.status === 'approved' ? <CheckCircle2 size={14} /> : null}
                          {existingRequest.status === 'rejected' ? <XCircle size={14} /> : null}
                          {String(existingRequest.status).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Requested on {existingRequest.requestedAt ? new Date(existingRequest.requestedAt).toLocaleString() : 'N/A'}
                      </p>
                      {existingRequest.status === 'rejected' && existingRequest.rejectionReason && (
                        <p className="mt-2 text-sm text-red-600">
                          Rejection reason: {existingRequest.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}

                  {(!existingRequest || existingRequest.status === 'rejected' || existingRequest.status === 'none') ? (
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Why do you want faculty role?</label>
                        <textarea
                          rows={4}
                          value={requestFormData.reason}
                          onChange={(e) => setRequestFormData((prev) => ({ ...prev, reason: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          placeholder="Explain your motivation and how you can contribute..."
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <label className="block text-sm font-semibold text-slate-700">Qualifications / Experience</label>
                        </div>
                        <textarea
                          rows={4}
                          value={requestFormData.qualifications}
                          onChange={(e) => setRequestFormData((prev) => ({ ...prev, qualifications: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                          placeholder="Share relevant teaching background, certifications, achievements..."
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="faculty-request-pdf"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              title="Upload PDF (max 5MB)"
                            >
                              <Plus size={16} />
                            </label>
                            <input
                              id="faculty-request-pdf"
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={handlePdfSelect}
                              className="hidden"
                            />
                          </div>
                          <p className="text-xs text-slate-500">Upload: PDF only, maximum size 5MB</p>
                        </div>
                        {requestPdfFile && (
                          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-xs text-slate-700 truncate">
                              {requestPdfFile.name} ({(requestPdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                            <button
                              type="button"
                              onClick={() => setRequestPdfFile(null)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setRequestModalOpen(false)}
                          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={requestSubmitting}
                          className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm">
                      Your request is currently under review. You can close this popup and check status later.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
