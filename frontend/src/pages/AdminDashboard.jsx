import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Activity, AlertTriangle, Database, Eye, FileText, Plus, Settings, 
  Users, Zap, Clock, BookOpen, TrendingUp, Download, LogOut, 
  LayoutDashboard, Menu, X, Bell, School, BarChart3, CheckCircle, Target, UserCheck, MapPin, DollarSign, AlertCircle, MoreVertical
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
import '../styles/dashboards.css';
import '../styles/mobile-sidebar.css';
import '../styles/enhanced-dashboard.css';
import '../styles/dark-mode.css';
import NotificationsDropdown from '../components/Common/NotificationsDropdown';
import DashboardSidebar from '../components/Layout/DashboardSidebar';
import HamburgerMenu from '../components/Layout/HamburgerMenu';
import LandingNavbar from '../components/Layout/LandingNavbar';
import ModernStatCard from '../components/Cards/ModernStatCard';
import MetricCard from '../components/Cards/MetricCard';
import ModernTable from '../components/Tables/ModernTable';
import SkeletonLoader from '../components/Common/SkeletonLoader';
import FacultyRequestsPanel from '../components/Admin/FacultyRequestsPanel';
import UniversitiesPanel from '../components/Admin/UniversitiesPanel';
import SystemSettingsPanel from '../components/Admin/SystemSettingsPanel';
import { 
  AnimatedLineChart, 
  AnimatedAreaChart, 
  AnimatedBarChart, 
  AnimatedDoughnutChart,
  PerformanceChart 
} from '../components';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 30, rotateX: -10 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, type: 'spring', stiffness: 100 }
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cursorGlowRef = useRef(null);

  // Data States
  const [stats, setStats] = useState({
    universities: 0,
    faculty: 0,
    students: 0,
    totalQuizzes: 0,
    activeQuizzes: 0,
    pendingRequests: 0,
    completedQuizzes: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);

  // Fetch Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch users
        const usersRes = await fetch(`${API_BASE_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        const fetchedUsers = usersData.data || [];

        // Fetch quizzes
        const quizzesRes = await fetch(`${API_BASE_URL}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const quizzesData = await quizzesRes.json();
        const fetchedQuizzes = quizzesData.data || [];

        // Fetch pending faculty requests
        let pendingFacultyRequests = 0;
        try {
          const requestsRes = await fetch(`${API_BASE_URL}/auth/faculty-requests?status=pending`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const requestsData = await requestsRes.json();
          pendingFacultyRequests = requestsData.count || 0;
        } catch (err) {
          console.log('Could not fetch faculty requests:', err);
        }

        // Store all data
        setAllUsers(fetchedUsers);
        setAllQuizzes(fetchedQuizzes);

        // Calculate stats
        const faculty = fetchedUsers.filter((u) => u.role === 'faculty').length;
        const students = fetchedUsers.filter((u) => u.role === 'student').length;
        const activeQuizzesCount = fetchedQuizzes.filter((q) => q.status === 'active' || q.status === 'published').length;
        const completedQuizzesCount = fetchedQuizzes.filter((q) => q.status === 'closed' || q.status === 'archived').length;

        setStats({
          universities: 1, // Placeholder
          faculty,
          students,
          totalQuizzes: fetchedQuizzes.length,
          activeQuizzes: activeQuizzesCount,
          pendingRequests: pendingFacultyRequests,
          completedQuizzes: completedQuizzesCount
        });

        // Get recent items
        setRecentUsers(fetchedUsers.slice(0, 5));
        setRecentQuizzes(fetchedQuizzes.slice(0, 5));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Don't show error toast on initial load
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // Cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = e.clientX - 40 + 'px';
        cursorGlowRef.current.style.top = e.clientY - 40 + 'px';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navigation Items
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'universities', label: 'Universities', icon: School },
    { id: 'faculty-requests', label: 'Faculty Requests', icon: UserCheck, badge: stats.pendingRequests > 0 ? stats.pendingRequests : null },
    { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'monitor', label: 'Monitor', icon: Eye, path: '/monitor-sessions' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'system-settings', label: 'System Settings', icon: Settings },
  ];

  // Colors for gradients
  const gradientCards = [
    {
      title: 'Total Users',
      value: allUsers.length || stats.students + stats.faculty,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      subtitle: `${stats.students} Students, ${stats.faculty} Faculty`
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes,
      change: '+5%',
      trend: 'up',
      icon: FileText,
      color: 'purple',
      subtitle: `${stats.activeQuizzes} Active`
    },
    {
      title: 'Active Sessions',
      value: stats.activeQuizzes * 2 + 10, // Mock calculation for liveliness
      change: '+18%',
      trend: 'up',
      icon: Activity,
      color: 'orange',
      subtitle: 'Currently monitoring'
    },
    {
      title: 'Universities',
      value: stats.universities,
      change: '0%',
      trend: 'neutral',
      icon: School,
      color: 'green',
      subtitle: 'Partner Institutions'
    }
  ];

  // Secondary Metrics for quick glance
  const secondaryMetrics = [
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Avg Response', value: '1.2s', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Server Status', value: '99.9%', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Issues', value: '0', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' }
  ];

  // Chart Data Construction
  const quizCategoryData = {
    labels: ['Math', 'Science', 'History', 'Programming', 'Physics', 'General'],
    datasets: [{
      label: 'Quizzes',
      data: [12, 19, 3, 5, 2, 3], // Mock distribution
      backgroundColor: 'rgba(59, 130, 246, 0.6)', 
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const resultStatusData = {
    labels: ['Active', 'Closed', 'Draft'],
    datasets: [{
      data: [stats.activeQuizzes, stats.completedQuizzes, stats.totalQuizzes - (stats.activeQuizzes + stats.completedQuizzes)],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)', // Green
        'rgba(239, 68, 68, 0.8)', // Red
        'rgba(156, 163, 175, 0.8)', // Gray
      ],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true } }
    },
    cutout: '75%',
  };

  // Generate time-series data for analytics charts
  const generateTimeSeriesLabels = (days) => {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return labels;
  };

  // Generate user growth data (simulated growth trend)
  const generateUserGrowthData = () => {
    const days = 30;
    const currentTotal = allUsers.length || 50;
    const startTotal = Math.max(10, currentTotal - Math.floor(Math.random() * 20 + 10));
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const progress = i / (days - 1);
      const randomVariation = Math.random() * 3 - 1;
      const value = Math.floor(startTotal + (currentTotal - startTotal) * progress + randomVariation);
      data.push(Math.max(startTotal, value));
    }
    return data;
  };

  // Generate quiz creation timeline data
  const generateQuizCreationData = () => {
    const days = 30;
    return Array.from({ length: days }, () => Math.floor(Math.random() * 5));
  };

  // Generate daily activity data
  const generateDailyActivityData = () => {
    const days = 30;
    const activeUsers = Array.from({ length: days }, () => 
      Math.floor(Math.random() * (80 - 40 + 1) + 40)
    );
    const quizAttempts = Array.from({ length: days }, () => 
      Math.floor(Math.random() * (60 - 30 + 1) + 30)
    );
    return { activeUsers, quizAttempts };
  };

  const downloadCSV = (data, filename) => {
    if (!data.length) return toast.error('No data to export');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => typeof v === 'object' ? '...' : v).join(','));
    const csv = [headers, ...rows].join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  return (
    <div className="dashboard-container flex min-h-screen font-sans pt-[72px]">
      <LandingNavbar />
      
      {/* Sidebar */}
      <DashboardSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeItem={activeTab}
        onNavigate={(item) => {
          if (item.path) {
            navigate(item.path);
            return;
          }
          setActiveTab(item.id);
          setSidebarOpen(false);
        }}
        customItems={tabs}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-72px)] overflow-hidden relative">
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 relative scroll-smooth">
          {/* Animated cursor glow effect (desktop only) */}
          <div 
            ref={cursorGlowRef}
            className="fixed w-24 h-24 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full pointer-events-none blur-3xl z-0 transition-transform duration-200 ease-out hidden lg:block"
          />

          <motion.div 
            initial="initial" 
            animate="animate" 
            variants={containerVariants} 
            className="w-full max-w-7xl mx-auto space-y-8 relative z-10"
          >
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="lg:hidden mb-3">
                  <HamburgerMenu
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    variant="outline"
                    size="md"
                    showLabel={true}
                  />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    Welcome back, {user?.firstName || 'Admin'}! 👋
                  </h1>
                  <p className="text-slate-600 text-base">
                    Here's an overview of your institution's performance today.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button 
                  onClick={() => navigate('/create-quiz')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold shadow-lg"
                >
                  <Plus size={20} strokeWidth={2.5} />
                  <span>Create Quiz</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadCSV(allUsers, 'dashboard-export.csv')}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  <Download size={18} strokeWidth={2.5} />
                  <span>Export</span>
                </motion.button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Stats Grid - Modern Gradient Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loading ? (
                    <SkeletonLoader type="stat-card" count={4} />
                  ) : (
                    gradientCards.map((stat, idx) => (
                      <ModernStatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        change={stat.change}
                        trend={stat.trend}
                        color={stat.color}
                        delay={idx}
                      />
                    ))
                  )}
                </div>

                {/* Secondary Metrics Bar */}
                <motion.div 
                  variants={itemVariants} 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {loading ? (
                    <SkeletonLoader type="mini-card" count={4} />
                  ) : (
                    secondaryMetrics.map((sm, i) => (
                      <MetricCard
                        key={sm.label}
                        label={sm.label}
                        value={sm.value}
                        icon={sm.icon}
                        color={sm.color.replace('text-', '').replace('-600', '')}
                        delay={i}
                      />
                    ))
                  )}
                </motion.div>

                {/* Recent Quizzes Section */}
                <motion.div 
                  variants={itemVariants}
                  className="dashboard-card bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Recent Quizzes</h3>
                        <p className="text-sm text-slate-600">Latest quizzes from all faculty</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('quizzes')}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      View All →
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                          <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No quizzes available yet</p>
                      <p className="text-sm text-slate-500 mb-4">Create your first quiz to get started</p>
                      <button
                        onClick={() => navigate('/create-quiz')}
                        className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                      >
                        <Plus className="h-4 w-4" />
                        Create Quiz
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentQuizzes.map((quiz, idx) => (
                        <motion.div
                          key={quiz._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-indigo-200"
                          onClick={() => navigate(`/quiz/${quiz._id}`)}
                        >
                          <div className={`p-3 rounded-lg ${
                            quiz.status === 'published' 
                              ? 'bg-emerald-100' 
                              : quiz.status === 'draft' 
                                ? 'bg-slate-200' 
                                : 'bg-orange-100'
                          }`}>
                            <BookOpen className={`h-6 w-6 ${
                              quiz.status === 'published' 
                                ? 'text-emerald-600' 
                                : quiz.status === 'draft' 
                                  ? 'text-slate-600' 
                                  : 'text-orange-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {quiz.title}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {quiz.duration} mins
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {quiz.totalMarks || 0} marks
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                quiz.status === 'published' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : quiz.status === 'draft' 
                                    ? 'bg-slate-200 text-slate-700' 
                                    : 'bg-orange-100 text-orange-700'
                              }`}>
                                {quiz.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(quiz.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Platform Analytics - User Growth & Quiz Creation */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {loading ? (
                    <>
                      <SkeletonLoader type="chart" />
                      <SkeletonLoader type="chart" />
                    </>
                  ) : (
                    <>
                      <AnimatedLineChart
                        title="User Growth Over Time"
                        subtitle="Total registered users (students + faculty)"
                        labels={generateTimeSeriesLabels(30)}
                        datasets={[
                          {
                            label: 'Total Users',
                            data: generateUserGrowthData(),
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgb(99, 102, 241)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                          },
                        ]}
                        height={350}
                        timeframe="Last 30 days"
                      />
                      
                      <AnimatedLineChart
                        title="Quiz Creation Timeline"
                        subtitle="New quizzes created daily"
                        labels={generateTimeSeriesLabels(30)}
                        datasets={[
                          {
                            label: 'Quizzes Created',
                            data: generateQuizCreationData(),
                            borderColor: 'rgb(168, 85, 247)',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgb(168, 85, 247)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                          },
                        ]}
                        height={350}
                        timeframe="Last 30 days"
                      />
                    </>
                  )}
                </div>

                {/* Daily Activity Comparison */}
                {!loading && (
                  <AnimatedAreaChart
                    title="Daily Platform Activity"
                    subtitle="Active users vs quiz attempts over time"
                    labels={generateTimeSeriesLabels(30)}
                    dataset1={{
                      label: 'Active Users',
                      data: generateDailyActivityData().activeUsers,
                      borderColor: 'rgb(16, 185, 129)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    }}
                    dataset2={{
                      label: 'Quiz Attempts',
                      data: generateDailyActivityData().quizAttempts,
                      borderColor: 'rgb(251, 146, 60)',
                      backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    }}
                    height={350}
                  />
                )}

                {/* Platform Analytics - User Growth & Quiz Creation */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {loading ? (
                    <>
                      <SkeletonLoader type="chart" />
                      <SkeletonLoader type="chart" />
                    </>
                  ) : (
                    <>
                      <AnimatedLineChart
                        title="User Growth Over Time"
                        subtitle="Total registered users (students + faculty)"
                        labels={generateTimeSeriesLabels(30)}
                        datasets={[
                          {
                            label: 'Total Users',
                            data: generateUserGrowthData(),
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgb(99, 102, 241)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                          },
                        ]}
                        height={350}
                        timeframe="Last 30 days"
                      />
                      
                      <AnimatedLineChart
                        title="Quiz Creation Timeline"
                        subtitle="New quizzes created daily"
                        labels={generateTimeSeriesLabels(30)}
                        datasets={[
                          {
                            label: 'Quizzes Created',
                            data: generateQuizCreationData(),
                            borderColor: 'rgb(168, 85, 247)',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgb(168, 85, 247)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                          },
                        ]}
                        height={350}
                        timeframe="Last 30 days"
                      />
                    </>
                  )}
                </div>

                {/* Daily Activity Comparison */}
                {!loading && (
                  <AnimatedAreaChart
                    title="Daily Platform Activity"
                    subtitle="Active users vs quiz attempts over time"
                    labels={generateTimeSeriesLabels(30)}
                    dataset1={{
                      label: 'Active Users',
                      data: generateDailyActivityData().activeUsers,
                      borderColor: 'rgb(16, 185, 129)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    }}
                    dataset2={{
                      label: 'Quiz Attempts',
                      data: generateDailyActivityData().quizAttempts,
                      borderColor: 'rgb(251, 146, 60)',
                      backgroundColor: 'rgba(251, 146, 60, 0.1)',
                    }}
                    height={350}
                  />
                )}

                {/* Performance Chart - Time Series */}
                {!loading && (
                  <PerformanceChart 
                    title="Quiz Performance Over Time"
                    subtitle="Completion rates, participation, and average scores"
                    height={350}
                    period="30 days"
                  />
                )}
                
                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {loading ? (
                    <>
                      <SkeletonLoader type="chart" />
                      <SkeletonLoader type="chart" />
                    </>
                  ) : (
                    <>
                      <AnimatedBarChart
                        title="Quiz Categories"
                        subtitle="Distribution by subject"
                        labels={['Math', 'Science', 'History', 'Programming', 'Physics', 'General']}
                        data={[12, 19, 3, 5, 2, 3]}
                        colorScheme="indigo"
                        height={350}
                      />
                      
                      <AnimatedDoughnutChart
                        title="Quiz Status Distribution"
                        subtitle="Current quiz lifecycle stages"
                        labels={['Active', 'Closed', 'Draft']}
                        data={[stats.activeQuizzes, stats.completedQuizzes, stats.totalQuizzes - (stats.activeQuizzes + stats.completedQuizzes)]}
                        colors={['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(156, 163, 175, 0.8)']}
                        height={350}
                      />
                    </>
                  )}
                </div>

                {/* Recent Activity / Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Users Table */}
                  <div className="lg:col-span-2">
                    {loading ? (
                      <SkeletonLoader type="table" />
                    ) : (
                      <ModernTable
                        title="Recent Users"
                        data={recentUsers}
                        columns={[
                          {
                            key: 'firstName',
                            label: 'Name',
                            sortable: true,
                            render: (_, row) => (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-sm">
                                  {row.firstName?.[0]}{row.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {row.firstName} {row.lastName}
                                  </p>
                                  <p className="text-xs text-slate-500">{row.email}</p>
                                </div>
                              </div>
                            )
                          },
                          {
                            key: 'role',
                            label: 'Role',
                            sortable: true,
                            render: (role) => (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                role === 'admin' 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : role === 'faculty' 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {role}
                              </span>
                            )
                          },
                          {
                            key: 'isActive',
                            label: 'Status',
                            render: (isActive) => (
                              <span className={`inline-flex items-center gap-2 text-xs font-semibold ${
                                isActive ? 'text-emerald-700' : 'text-slate-500'
                              }`}>
                                <span className={`badge-dot ${isActive ? 'badge-dot-success' : 'badge-dot-danger'}`} />
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            )
                          },
                          {
                            key: 'createdAt',
                            label: 'Joined',
                            sortable: true,
                            render: (date) => (
                              <span className="text-sm text-slate-600">
                                {new Date(date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            )
                          }
                        ]}
                        searchable={true}
                        onExport={(data) => downloadCSV(data, 'users.csv')}
                        emptyMessage="No users found"
                        actions={true}
                      />
                    )}
                  </div>

                  {/* System Health / Quick Stats */}
                  <motion.div 
                    variants={itemVariants} 
                    className="dashboard-card bg-white rounded-2xl border border-slate-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-slate-800">System Health</h3>
                      <span className="badge-dot badge-dot-success"></span>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">Server Load</span>
                          <span className="font-bold text-emerald-600">24%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: '24%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">Memory Usage</span>
                          <span className="font-bold text-blue-600">58%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: '58%' }}
                            transition={{ duration: 1, delay: 0.6 }}
                            style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">Storage</span>
                          <span className="font-bold text-orange-600">82%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: '82%' }}
                            transition={{ duration: 1, delay: 0.7 }}
                            style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-200 mt-6">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-500" />
                          Recent Activity
                        </h4>
                        <div className="space-y-3">
                          {[
                            { text: 'Database backup completed', time: '5 min ago', color: 'emerald' },
                            { text: 'New quiz published', time: '12 min ago', color: 'blue' },
                            { text: 'User registration spike', time: '30 min ago', color: 'orange' }
                          ].map((activity, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 + 0.8 }}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <div className={`badge-dot badge-dot-${activity.color} mt-1.5`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {activeTab === 'faculty-requests' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FacultyRequestsPanel />
              </motion.div>
            )}

            {activeTab === 'universities' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <UniversitiesPanel />
              </motion.div>
            )}

            {activeTab === 'system-settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <SystemSettingsPanel />
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">User Management</h2>
                  <button onClick={() => downloadCSV(allUsers, 'all_users.csv')} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Download CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUsers.map(user => (
                        <tr key={user._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                          <td className="px-6 py-4 text-slate-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs uppercase font-semibold ${
                              user.role === 'admin' 
                                ? 'bg-red-50 text-red-700' 
                                : user.role === 'faculty' 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'bg-green-50 text-green-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-slate-400 hover:text-indigo-600"><Settings size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'quizzes' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200">
                 <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">All Quizzes</h2>
                  <button onClick={() => downloadCSV(allQuizzes, 'all_quizzes.csv')} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Download CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Questions</th>
                        <th className="px-6 py-4">Created By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allQuizzes.map(quiz => (
                        <tr key={quiz._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium">{quiz.title}</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{quiz.accessCode}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              quiz.status === 'active' ? 'bg-green-100 text-green-700' : 
                              quiz.status === 'published' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {quiz.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{quiz.totalQuestions || quiz.questions?.length || 0}</td>
                          <td className="px-6 py-4 text-slate-600">{quiz.createdBy?.firstName || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

