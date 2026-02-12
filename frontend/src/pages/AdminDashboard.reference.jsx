import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Settings, 
  DollarSign, 
  FileText, 
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Menu,
  X,
  School,
  Award,
  Target,
  BookOpen,
  UserCheck
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

const AdminDashboardComplete = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 38,
    totalQuizzes: 138,
    resolved: 74,
    openIssues: 5,
    criticalIssues: 0,
    avgResponseTime: '2.4 hrs',
    resolutionRate: '54%',
    inProgress: 3
  });

  // Sidebar navigation items matching GRAMS design
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: FileText, label: 'Quizzes', id: 'quizzes' },
    { icon: AlertTriangle, label: 'Issues', id: 'issues' },
    { icon: Users, label: 'Students', id: 'students' },
    { icon: DollarSign, label: 'Reports', id: 'reports' },
    { icon: Settings, label: 'Settings', id: 'settings' },
    { icon: MapPin, label: 'Analytics', id: 'analytics' }
  ];

  // Chart data for "Quizzes by Category"
  const quizCategoryData = {
    labels: ['Math', 'Science', 'History', 'English', 'Geography', 'Physics', 'Chemistry', 'Biology'],
    datasets: [{
      label: 'Number of Quizzes',
      data: [18, 16, 15, 14, 17, 12, 14, 16],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(34, 197, 94, 0.7)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(34, 197, 94, 0.5)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(34, 197, 94, 0.4)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(34, 197, 94, 0.7)',
      ],
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 1,
      borderRadius: 8,
    }]
  };

  // Chart data for "Results by Status"
  const resultStatusData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [60, 30, 10],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(156, 163, 175, 0.8)',
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(251, 146, 60, 1)', 
        'rgba(156, 163, 175, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgba(0, 0, 0, 0.7)',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
      }
    },
    cutout: '60%',
  };

  // Statistics cards data
  const statsCards = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      change: '+8.3%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      subtitle: 'Registered platform users'
    },
    {
      title: 'Total Quizzes', 
      value: dashboardData.totalQuizzes,
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      color: 'purple',
      subtitle: 'All submissions'
    },
    {
      title: 'Completed',
      value: dashboardData.resolved,
      change: '+15.7%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green',
      subtitle: 'Successfully completed'
    },
    {
      title: 'In Progress',
      value: dashboardData.openIssues,
      change: '+6.2%',
      trend: 'up', 
      icon: Clock,
      color: 'orange',
      subtitle: 'Currently active'
    }
  ];

  // Secondary metrics
  const secondaryMetrics = [
    {
      title: 'Critical Issues',
      value: dashboardData.criticalIssues,
      subtitle: 'High priority issues',
      icon: AlertCircle,
      color: 'red'
    },
    {
      title: 'Avg Response Time',
      value: dashboardData.avgResponseTime,
      subtitle: 'Last 30 days',
      icon: Clock,
      color: 'blue'
    },
    {
      title: 'Success Rate',
      value: dashboardData.resolutionRate,
      subtitle: 'Successfully resolved',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Active Sessions',
      value: dashboardData.inProgress,
      subtitle: 'Currently online',
      icon: UserCheck,
      color: 'orange'
    }
  ];

  const handleNavigation = (item) => {
    setActiveSection(item.id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            PL
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">Proctolearn</h1>
            <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Admin</span>
          </div>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu size={24} className="text-slate-600" />
        </button>
      </div>

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem={activeSection}
          onNavigate={handleNavigation}
          customItems={sidebarItems}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                    Welcome back, {user?.firstName || 'Admin'}! 👋
                  </h1>
                  <p className="text-slate-600">Here's what's happening with your platform today.</p>
                </div>
                <button className="hidden lg:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                  <Target size={16} />
                  New Report
                </button>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${
                    stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    stat.color === 'green' ? 'from-green-500 to-green-600' :
                    'from-orange-500 to-orange-600'
                  } p-6 lg:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
                      <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <stat.icon size={24} />
                        </div>
                        <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                          stat.trend === 'up' ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                        }`}>
                          {stat.change}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm opacity-90">{stat.title}</p>
                        <p className="text-3xl lg:text-4xl font-bold">{stat.value}</p>
                        <p className="text-xs opacity-75">{stat.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {secondaryMetrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 4) * 0.1, duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      metric.color === 'red' ? 'bg-red-100 text-red-600' :
                      metric.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      metric.color === 'green' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <metric.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">{metric.title}</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold mb-1 ${
                    metric.color === 'red' ? 'text-red-600' :
                    metric.color === 'blue' ? 'text-blue-600' :
                    metric.color === 'green' ? 'text-green-600' :
                    'text-orange-600'
                  }`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-slate-500">{metric.subtitle}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-1">Quizzes by Category</h3>
                    <p className="text-sm text-slate-600">Distribution across subjects</p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical size={20} className="text-slate-400" />
                  </button>
                </div>
                <div className="h-64 lg:h-80">
                  <Bar data={quizCategoryData} options={chartOptions} />
                </div>
              </motion.div>

              {/* Doughnut Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-1">Results by Status</h3>
                    <p className="text-sm text-slate-600">Current completion status</p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical size={20} className="text-slate-400" />
                  </button>
                </div>
                <div className="h-64 lg:h-80">
                  <Doughnut data={resultStatusData} options={doughnutOptions} />
                </div>
              </motion.div>
            </div>

            {/* Recent Activity Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-8 bg-white/90 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-xl border border-slate-200/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-1">Recent Activity</h3>
                  <p className="text-sm text-slate-600">Latest platform activities</p>
                </div>
                <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors">
                  View all
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { user: 'John Doe', action: 'completed Math Quiz', score: '95%', time: '2 mins ago', avatar: 'JD' },
                  { user: 'Sarah Smith', action: 'started Science Quiz', score: 'In Progress', time: '5 mins ago', avatar: 'SS' },
                  { user: 'Mike Johnson', action: 'completed History Quiz', score: '87%', time: '12 mins ago', avatar: 'MJ' },
                  { user: 'Emily Davis', action: 'joined the platform', score: 'New User', time: '18 mins ago', avatar: 'ED' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {activity.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        <span className="font-bold">{activity.user}</span> {activity.action}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.score === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                          activity.score === 'New User' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {activity.score}
                        </span>
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardComplete;