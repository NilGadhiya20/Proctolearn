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
import NotificationsDropdown from '../components/Common/NotificationsDropdown';
import DashboardSidebar from '../components/Layout/DashboardSidebar';
import LandingNavbar from '../components/Layout/LandingNavbar';

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
          pendingRequests: 0,
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
    { id: 'quizzes', label: 'Quizzes', icon: BookOpen }, // Merged view
    { id: 'users', label: 'Users', icon: Users }, // Merged view
    { id: 'monitor', label: 'Monitor', icon: Eye, path: '/monitor-sessions' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
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
    <div className="flex min-h-screen bg-slate-50 font-sans pt-[72px]">
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
        {/* Header Removed as per user request */}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative scroll-smooth bg-slate-50/50">
          {/* Background Glow */}
          <div 
            ref={cursorGlowRef}
            className="fixed w-20 h-20 bg-indigo-500/30 rounded-full pointer-events-none blur-xl z-0 transition-transform duration-100 ease-out hidden lg:block"
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
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  <Menu size={18} />
                  <span className="font-medium text-sm">Menu</span>
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Welcome back, {user?.firstName || 'Admin'}! 👋
                </h1>
                <p className="text-slate-600 mt-1">Here's an overview of your institution's performance.</p>
              </div>
              <button 
                onClick={() => navigate('/create-quiz')}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 font-medium"
              >
                <Plus size={18} />
                New Quiz
              </button>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Stats Grid - Gradient Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gradientCards.map((stat, idx) => (
                    <motion.div
                      key={stat.title}
                      variants={itemVariants}
                      custom={idx}
                      className={`relative overflow-hidden rounded-2xl p-4 text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group bg-gradient-to-br ${
                        stat.color === 'blue' ? 'from-blue-600 via-blue-500 to-indigo-600' :
                        stat.color === 'purple' ? 'from-purple-600 via-purple-500 to-fuchsia-600' :
                        stat.color === 'orange' ? 'from-orange-500 via-orange-400 to-red-500' :
                        'from-emerald-500 via-emerald-400 to-teal-600'
                      }`}
                    >
                      {/* Abstract Background Shapes */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />
                      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/5 rounded-full blur-xl" />

                      <div className="absolute top-0 right-0 p-3 opacity-10 transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110">
                        <stat.icon size={80} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner group-hover:bg-white/30 transition-colors">
                            <stat.icon size={20} />
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-black/20 text-white px-2.5 py-1 rounded-full backdrop-blur-md border border-white/5">
                            {stat.trend === 'up' ? <TrendingUp size={10} className="text-emerald-300" /> : <Activity size={10} />}
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-sm text-white/90 font-medium mb-0.5 tracking-wide">{stat.title}</p>
                        <h3 className="text-3xl font-extrabold mb-1 tracking-tight drop-shadow-sm">{stat.value}</h3>
                        <p className="text-xs text-white/70 font-medium">{stat.subtitle}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Secondary Metrics Bar */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {secondaryMetrics.map((sm, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-indigo-50/40 hover:border-indigo-200">
                      <div className={`p-2 rounded-lg ${sm.bg} ${sm.color}`}>
                        <sm.icon size={20} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase">{sm.label}</p>
                        <p className="text-slate-900 font-bold">{sm.value}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-800">Quiz Categories</h3>
                      <button className="text-slate-400 hover:bg-slate-50 p-1 rounded"><MoreVertical size={20}/></button>
                    </div>
                    <div className="h-72">
                      <Bar data={quizCategoryData} options={chartOptions} />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-800">Quiz Status Distribution</h3>
                      <button className="text-slate-400 hover:bg-slate-50 p-1 rounded"><MoreVertical size={20}/></button>
                    </div>
                    <div className="h-72 flex items-center justify-center">
                      <Doughnut data={resultStatusData} options={doughnutOptions} />
                    </div>
                  </motion.div>
                </div>

                {/* Recent Activity / Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Users */}
                  <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-200">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-slate-800">Recent Users</h3>
                      <button onClick={() => downloadCSV(allUsers, 'users.csv')} className="text-sm text-indigo-600 font-medium hover:underline">Export</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Role</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {recentUsers.map((u, i) => (
                            <tr key={i} className="group hover:bg-slate-50 transition-colors duration-200 border-l-[3px] border-transparent hover:border-indigo-500">
                              <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 ring-2 ring-white shadow-sm group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                  {u.firstName?.[0]}
                                </div>
                                <span className="group-hover:text-indigo-700 transition-colors">{u.firstName} {u.lastName}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                                  u.role === 'admin' 
                                    ? 'bg-red-50 text-red-700 border-red-100 group-hover:bg-red-100'
                                    : u.role === 'faculty' 
                                      ? 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-100' 
                                      : 'bg-green-50 text-green-700 border-green-100 group-hover:bg-green-100'
                                } transition-colors`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`flex items-center gap-2 text-xs font-medium ${u.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                  <span className={`relative flex h-2 w-2`}>
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${u.isActive ? 'bg-emerald-400' : 'hidden'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                  </span>
                                  {u.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                                {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                            </tr>
                          ))}
                          {recentUsers.length === 0 && (
                            <tr><td colSpan="4" className="text-center py-8 text-slate-500">No users found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  {/* System Health / Quick Stats */}
                  <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:border-indigo-200">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">System Health</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Server Load</span>
                          <span className="font-semibold text-emerald-600">24%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '24%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Memory Usage</span>
                          <span className="font-semibold text-blue-600">58%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '58%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Storage</span>
                          <span className="font-semibold text-orange-600">82%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: '82%' }} />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 mt-6">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Pending Tasks</h4>
                        <div className="space-y-3">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="mt-1 min-w-[16px]">
                                <div className="w-4 h-4 rounded border border-slate-300" />
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-1">Review faculty application #{100+i}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
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

