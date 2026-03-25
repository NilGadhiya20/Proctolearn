import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BookOpen, Users, BarChart3, Clock, Plus, TrendingUp, AlertCircle, CheckCircle, Monitor, Download } from 'lucide-react';
import { MainLayout } from '../components';
import CountUp from '../components/CountUp';
import socket from '../socket';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { useAuthStore } from '../context/store';
import '../styles/dashboards.css';
import '../styles/dark-mode.css';
import '../styles/mobile-buttons.css';

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

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-20, 20, -20],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
  }
};

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myQuizzes: 0,
    students: 0,
    submissions: 0,
    pendingGrading: 0
  });
  const [quizzes, setQuizzes] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [activeStudents, setActiveStudents] = useState(0);

  const downloadQuizzesCSV = () => {
    if (quizzes.length === 0) {
      toast.error('No quizzes to download');
      return;
    }
    const headers = ['Title', 'Status', 'Duration (mins)', 'Questions', 'Students', 'Created Date'];
    const rows = quizzes.map(q => [
      q.title,
      q.status,
      q.duration || 0,
      q.totalQuestions || 0,
      q.assignedStudents?.length || 0,
      new Date(q.createdAt).toLocaleDateString()
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-quizzes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Downloaded ${quizzes.length} quizzes`);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE_URL}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const allQuizzes = data.data || [];

        setStats({
          myQuizzes: allQuizzes.length,
          students: 150,
          submissions: 85,
          pendingGrading: 15
        });

        setQuizzes(allQuizzes.slice(0, 4));
      } catch (err) {
        console.error('Error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!user) return;

    const institutionId = user?.institution?._id || user?.institution;
    const facultyId = user?._id;

    // Join faculty room for real-time updates
    socket.emit('join-faculty-room', { institutionId, facultyId });

    // Listen for real-time stats updates
    const onFacultyStats = (payload) => {
      if (payload?.stats) {
        setLiveStats(payload.stats);
      }
    };

    // Listen for quiz activity
    const onQuizActivity = (activity) => {
      setActivityFeed((prev) => {
        const newFeed = [activity, ...prev];
        return newFeed.slice(0, 20); // Keep last 20 activities
      });
    };

    // Listen for active students count
    const onActiveStudents = (data) => {
      setActiveStudents(data.count || 0);
    };

    // Listen for quiz updates
    const onQuizUpdate = (quiz) => {
      setQuizzes((prev) => {
        const index = prev.findIndex(q => q._id === quiz._id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = quiz;
          return updated;
        }
        return [quiz, ...prev].slice(0, 4);
      });
    };

    // Listen for new submissions
    const onNewSubmission = (data) => {
      setStats(prev => ({
        ...prev,
        submissions: prev.submissions + 1,
        pendingGrading: prev.pendingGrading + 1
      }));
      toast.success(`New submission from ${data.studentName}`);
    };

    socket.on('faculty-stats', onFacultyStats);
    socket.on('quiz-activity', onQuizActivity);
    socket.on('active-students', onActiveStudents);
    socket.on('quiz-update', onQuizUpdate);
    socket.on('new-submission', onNewSubmission);

    return () => {
      socket.off('faculty-stats', onFacultyStats);
      socket.off('quiz-activity', onQuizActivity);
      socket.off('active-students', onActiveStudents);
      socket.off('quiz-update', onQuizUpdate);
      socket.off('new-submission', onNewSubmission);
    };
  }, [user]);

  return (
    <MainLayout>
      <ResponsivePageLayout maxWidth="7xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="w-full space-y-8"
        >
          {/* Hero Header */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl faculty-gradient text-white p-8 md:p-12 shadow-2xl"
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div variants={floatingVariants} initial="initial" animate="animate">
                  <p className="text-lg font-semibold opacity-90 mb-2">📚 Faculty Portal</p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-3">
                    Welcome, {user?.firstName || 'Faculty'}! 👨‍🏫
                  </h1>
                  <p className="text-lg opacity-90 max-w-2xl">
                    Create quizzes, manage students, monitor live sessions and grade submissions effectively.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {[
              { title: 'My Quizzes', value: liveStats?.myQuizzes ?? stats.myQuizzes, icon: BookOpen, color: 'green' },
              { title: 'Active Students', value: activeStudents, icon: Users, color: 'emerald', live: true },
              { title: 'Submissions', value: liveStats?.submissions ?? stats.submissions, icon: BarChart3, color: 'purple' },
              { title: 'Pending', value: liveStats?.pendingGrading ?? stats.pendingGrading, icon: Clock, color: 'red' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                custom={idx}
                className="card-3d group cursor-pointer"
              >
                <div className={`bg-green-50 border-2 border-green-200 rounded-2xl p-6 h-full relative overflow-hidden smooth-hover`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className={`absolute -right-10 -top-10 w-32 h-32 bg-green-200 rounded-full blur-2xl opacity-20`}
                    />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`inline-flex p-3 rounded-xl bg-green-100`}>
                        <stat.icon className={`h-6 w-6 text-green-600`} />
                      </div>
                      {stat.live && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm font-semibold mb-2">{stat.title}</p>
                    <CountUp end={Number(stat.value) || 0} duration={1.2} className="text-3xl font-bold text-slate-900" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl bg-white border-2 border-slate-100 p-6 shadow-lg smooth-hover"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="h-6 w-6 text-teal-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Create Quiz', icon: '➕', color: 'green', action: () => navigate('/create-quiz') },
                  { label: 'My Quizzes', icon: '📚', color: 'green', action: () => navigate('/my-quizzes') },
                  { label: 'Grade Submissions', icon: '✅', color: 'green', action: () => navigate('/grade-submissions') },
                  { label: 'View Reports', icon: '📊', color: 'green', action: () => navigate('/view-reports') },
                  { label: 'Monitor Sessions', icon: '👁️', color: 'green', action: () => navigate('/monitor-sessions') },
                  { label: 'Manage Students', icon: '👥', color: 'green', action: () => toast.success('Student management coming') }
                ].map((action, idx) => (
                  <motion.button
                    key={idx}
                    variants={itemVariants}
                    custom={idx}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition"
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="font-semibold text-slate-900 group-hover:text-green-600 transition">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Stats Summary */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="rounded-2xl faculty-gradient text-white p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Performance
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Active Quizzes</span>
                      <span className="font-bold">6/12</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '50%' }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Submissions Graded</span>
                      <span className="font-bold">70/85</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Card */}
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-red-900">Attention Needed</h4>
                    <p className="text-sm text-red-700 mt-1">
                      15 submissions pending grading. Review them to provide feedback to students.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tip Card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6"
              >
                <h3 className="font-bold text-slate-900 mb-2">💡 Pro Tip</h3>
                <p className="text-sm text-slate-700">
                  Use live monitoring to catch suspicious activities during quizzes in real-time.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Live Activity Feed */}
          <motion.div
            variants={itemVariants}
            className="grid gap-6 lg:grid-cols-2"
          >
            {/* Activity Feed */}
            <div className="rounded-2xl bg-white border-2 border-slate-100 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  Live Activity
                </h2>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Real-time
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityFeed.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    <Monitor className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  activityFeed.map((activity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'submission' ? 'bg-green-100' :
                        activity.type === 'started' ? 'bg-teal-100' :
                        activity.type === 'suspicious' ? 'bg-red-100' :
                        'bg-slate-100'
                      }`}>
                        {activity.type === 'submission' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                         activity.type === 'started' ? <Monitor className="h-4 w-4 text-teal-600" /> :
                         activity.type === 'suspicious' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                         <Clock className="h-4 w-4 text-slate-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.studentName || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {activity.quizTitle || activity.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Quick Stats
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Active Quizzes', value: liveStats?.activeQuizzes ?? 0, color: 'blue' },
                  { label: 'Total Attempts', value: liveStats?.totalAttempts ?? 0, color: 'green' },
                  { label: 'Avg. Score', value: liveStats?.avgScore ? `${liveStats.avgScore}%` : 'N/A', color: 'amber' },
                  { label: 'Pass Rate', value: liveStats?.passRate ? `${liveStats.passRate}%` : 'N/A', color: 'emerald' }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{stat.label}</span>
                    <span className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Quizzes */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-white border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-green-600" />
                Your Recent Quizzes
              </h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadQuizzesCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/my-quizzes')}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  View All
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No quizzes created yet. Start by creating your first quiz!</p>
                </div>
              ) : (
                quizzes.map((quiz, idx) => (
                  <motion.div
                    key={quiz._id}
                    variants={itemVariants}
                    custom={idx}
                    className="stagger-item p-4 rounded-xl border border-slate-200 hover:border-green-400 hover:bg-green-50 transition cursor-pointer group"
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-green-600 transition">
                          {quiz.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {quiz.duration} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" /> {quiz.totalQuestions || 0} Q
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" /> {quiz.assignedStudents?.length || 0} students
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                        quiz.status === 'active' ? 'bg-green-100 text-green-700' : 
                        quiz.status === 'published' ? 'bg-teal-100 text-teal-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {quiz.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </ResponsivePageLayout>
    </MainLayout>
  );
};

export default FacultyDashboard;
