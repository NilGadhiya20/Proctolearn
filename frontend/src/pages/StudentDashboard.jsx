import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Menu,
  TrendingUp,
  BarChart3,
  User,
  Settings,
  LogOut,
  UserCheck,
  Play
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
import '../styles/dashboards.css';
import '../styles/dark-mode.css';

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
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    completedQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    upcoming: 0
  });

  // Student sidebar navigation items
  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', id: 'dashboard' },
    { icon: BookOpen, label: 'Available Quizzes', id: 'quizzes', action: () => navigate('/available-quizzes') },
    { icon: Award, label: 'My Results', id: 'results' },
    { icon: Target, label: 'Progress', id: 'progress' },
    { icon: UserCheck, label: 'Request Faculty Role', id: 'request-faculty', action: () => navigate('/request-faculty') },
    { icon: User, label: 'Profile', id: 'profile' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ];

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
  
  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    }
    setSidebarOpen(false);
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
  }, [user]);

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

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem="dashboard"
          onNavigate={handleNavigation}
          customItems={sidebarItems}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            
            {/* Welcome Section */}
            <motion.div
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
              
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

          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
