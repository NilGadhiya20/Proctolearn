import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Activity,
  AlertTriangle,
  Eye,
  FileText,
  Plus,
  Settings,
  Users,
  Zap,
  Clock,
  BookOpen,
  Download,
  LayoutDashboard,
  School,
  BarChart3,
  CheckCircle,
  Target,
  UserCheck,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useAuthStore } from "../context/store";
import socket from "../socket";
import "../styles/dashboards.css";
import "../styles/mobile-sidebar.css";
import "../styles/enhanced-dashboard.css";
import "../styles/dark-mode.css";
import DashboardSidebar from "../components/Layout/DashboardSidebar";
import HamburgerMenu from "../components/Layout/HamburgerMenu";
import LandingNavbar from "../components/Layout/LandingNavbar";
import ModernStatCard from "../components/Cards/ModernStatCard";
import MetricCard from "../components/Cards/MetricCard";
import ModernTable from "../components/Tables/ModernTable";
import SkeletonLoader from "../components/Common/SkeletonLoader";
import FacultyRequestsPanel from "../components/Admin/FacultyRequestsPanel";
import UniversitiesPanel from "../components/Admin/UniversitiesPanel";
import SystemSettingsPanel from "../components/Admin/SystemSettingsPanel";
import {
  AnimatedLineChart,
  AnimatedAreaChart,
  AnimatedBarChart,
  AnimatedDoughnutChart,
  PerformanceChart,
} from "../components";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 30, rotateX: -10 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, type: "spring", stiffness: 100 },
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [liveActivity, setLiveActivity] = useState([]);
  const cursorGlowRef = useRef(null);
  const refreshTimeoutRef = useRef(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  // Data States
  const [stats, setStats] = useState({
    universities: 0,
    faculty: 0,
    students: 0,
    totalQuizzes: 0,
    activeQuizzes: 0,
    pendingRequests: 0,
    completedQuizzes: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]);

  const fetchDashboardData = useCallback(async (options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) {
        setLoading(true);
      }

      const token = localStorage.getItem("token");

      const authHeaders = { Authorization: `Bearer ${token}` };

      const extractArray = (payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.users)) return payload.users;
        if (Array.isArray(payload?.quizzes)) return payload.quizzes;
        if (Array.isArray(payload?.results)) return payload.results;
        if (Array.isArray(payload?.items)) return payload.items;
        return [];
      };

      const fetchArrayFromCandidates = async (candidateUrls) => {
        for (const url of candidateUrls) {
          try {
            const response = await fetch(url, { headers: authHeaders });
            const payload = await response.json();
            if (!response.ok) continue;
            const list = extractArray(payload);
            if (Array.isArray(list)) {
              return list;
            }
          } catch (_) {
            // Try next candidate
          }
        }
        return [];
      };

      // Fetch users
      const fetchedUsers = await fetchArrayFromCandidates([
        `${API_BASE_URL}/users/users`,
        `${API_BASE_URL}/auth/users`,
      ]);

      // Fetch quizzes
      const fetchedQuizzes = await fetchArrayFromCandidates([
        `${API_BASE_URL}/quizzes?limit=1000&page=1`,
        `${API_BASE_URL}/quizzes`,
      ]);

      // Fetch pending faculty requests
      let pendingFacultyRequests = 0;
      try {
        const requestsRes = await fetch(
          `${API_BASE_URL}/auth/faculty-requests?status=pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const requestsData = await requestsRes.json();
        pendingFacultyRequests = requestsData.count || 0;
      } catch (err) {
        console.log("Could not fetch faculty requests:", err);
      }

      // Fetch institutions (admin scoped)
      let fetchedInstitutions = [];
      try {
        const institutionsRes = await fetch(
          `${API_BASE_URL}/institutions?limit=1000&page=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const institutionsData = await institutionsRes.json();
        fetchedInstitutions = institutionsData.data || [];
      } catch (err) {
        console.log("Could not fetch institutions:", err);
      }

      // Store all data
      setAllUsers(fetchedUsers);
      setAllQuizzes(fetchedQuizzes);
      setAllInstitutions(fetchedInstitutions);

      // Calculate stats
      const faculty = fetchedUsers.filter((u) => u.role === "faculty").length;
      const students = fetchedUsers.filter((u) => u.role === "student").length;
      const activeQuizzesCount = fetchedQuizzes.filter(
        (q) => q.status === "active" || q.status === "published",
      ).length;
      const completedQuizzesCount = fetchedQuizzes.filter(
        (q) => q.status === "closed" || q.status === "archived",
      ).length;

      setStats((prev) => ({
        ...prev,
        universities: fetchedInstitutions.length,
        faculty,
        students,
        totalQuizzes: fetchedQuizzes.length,
        activeQuizzes: activeQuizzesCount,
        pendingRequests: pendingFacultyRequests,
        completedQuizzes: completedQuizzesCount,
      }));

      // Get recent items
      const sortedUsers = [...fetchedUsers].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
      const sortedQuizzes = [...fetchedQuizzes].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      setRecentUsers(sortedUsers.slice(0, 5));
      setRecentQuizzes(sortedQuizzes.slice(0, 5));
      setLastUpdatedAt(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch + fallback polling to keep dashboard truly live
  useEffect(() => {
    if (!user) return;

    fetchDashboardData();

    const refreshInterval = setInterval(() => {
      fetchDashboardData({ silent: true });
    }, 15000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user, fetchDashboardData]);

  // Socket.IO Connection
  useEffect(() => {
    if (!user) return;

    const institutionId = user.institution?._id || user.institution;

    const scheduleRealtimeRefresh = () => {
      if (refreshTimeoutRef.current) return;
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTimeoutRef.current = null;
        fetchDashboardData({ silent: true });
      }, 1200);
    };

    const onConnect = () => {
      console.log("Connected to Admin Dashboard WebSocket");
      setIsConnected(true);
      socket.emit("join-dashboard", { institutionId });
      scheduleRealtimeRefresh();
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onDashboardStats = (data) => {
      if (data?.stats) {
        setStats((prev) => ({
          ...prev,
          ...data.stats,
          // Map backend stats to our local state keys if they differ
          faculty: data.stats.faculty ?? prev.faculty,
          students: data.stats.students ?? prev.students,
          totalQuizzes: data.stats.totalQuizzes ?? prev.totalQuizzes,
          activeQuizzes: data.stats.activeQuizzes ?? prev.activeQuizzes,
        }));
      }
      scheduleRealtimeRefresh();
    };

    const onDashboardActivity = (activity) => {
      setLiveActivity((prev) => [activity, ...prev].slice(0, 50));

      // Optional: show toast for critical activities
      if (activity.severity === "critical") {
        toast.error(`Critical Action: ${activity.type}`, { duration: 5000 });
      }
      scheduleRealtimeRefresh();
    };

    const onDataMutationEvent = () => {
      scheduleRealtimeRefresh();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("dashboard-stats", onDashboardStats);
    socket.on("dashboard-activity", onDashboardActivity);
    socket.on("quiz-updated", onDataMutationEvent);
    socket.on("quiz-status-changed", onDataMutationEvent);
    socket.on("submission-complete", onDataMutationEvent);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("dashboard-stats", onDashboardStats);
      socket.off("dashboard-activity", onDashboardActivity);
      socket.off("quiz-updated", onDataMutationEvent);
      socket.off("quiz-status-changed", onDataMutationEvent);
      socket.off("submission-complete", onDataMutationEvent);
    };
  }, [user, fetchDashboardData]);

  // Cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = e.clientX - 40 + "px";
        cursorGlowRef.current.style.top = e.clientY - 40 + "px";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Navigation Items
  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "universities", label: "Universities", icon: School },
    {
      id: "faculty-requests",
      label: "Faculty Requests",
      icon: UserCheck,
      badge: stats.pendingRequests > 0 ? stats.pendingRequests : null,
    },
    { id: "quizzes", label: "Quizzes", icon: BookOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "monitor", label: "Monitor", icon: Eye, path: "/monitor-sessions" },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "system-settings", label: "System Settings", icon: Settings },
  ];

  const handleTabNavigation = (item) => {
    if (item.path) {
      navigate(item.path);
      return;
    }
    setActiveTab(item.id);
    setSidebarOpen(false);
  };

  // Colors for gradients
  const activeSessionsCount = useMemo(() => {
    const activeKeys = new Set();
    const threshold = Date.now() - 10 * 60 * 1000;

    liveActivity.forEach((activity) => {
      const ts = new Date(activity?.timestamp || 0).getTime();
      if (!ts || Number.isNaN(ts) || ts < threshold) return;
      const key =
        activity?.submissionId ||
        activity?.studentId ||
        activity?.user?._id ||
        activity?.studentEmail ||
        activity?.timestamp;
      activeKeys.add(String(key));
    });

    return activeKeys.size;
  }, [liveActivity]);

  const publishedQuizzesCount = useMemo(
    () => allQuizzes.filter((q) => q.status === "published").length,
    [allQuizzes],
  );

  const draftQuizzesCount = useMemo(
    () => allQuizzes.filter((q) => q.status === "draft").length,
    [allQuizzes],
  );

  const inactiveUsersCount = useMemo(
    () => allUsers.filter((u) => !u.isActive).length,
    [allUsers],
  );

  const recentEventsCount = useMemo(() => {
    const threshold = Date.now() - 60 * 60 * 1000;
    return liveActivity.filter((a) => {
      const ts = new Date(a?.timestamp || 0).getTime();
      return ts && !Number.isNaN(ts) && ts >= threshold;
    }).length;
  }, [liveActivity]);

  const quizSubjectDistribution = useMemo(() => {
    const subjectCounts = new Map();

    allQuizzes.forEach((quiz) => {
      const raw = quiz?.subject || "Unspecified";
      const normalized = String(raw).trim() || "Unspecified";
      subjectCounts.set(normalized, (subjectCounts.get(normalized) || 0) + 1);
    });

    const sorted = [...subjectCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      labels: sorted.map(([label]) => label),
      data: sorted.map(([, count]) => count),
    };
  }, [allQuizzes]);

  const activityFeedSummary = useMemo(() => {
    return liveActivity.slice(0, 3).map((activity) => {
      const label = String(activity?.type || "platform_event")
        .replace(/_/g, " ")
        .toLowerCase();

      const time = activity?.timestamp
        ? new Date(activity.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "just now";

      let color = "blue";
      if (String(activity?.severity || "").toLowerCase() === "critical") {
        color = "red";
      } else if (label.includes("register") || label.includes("user")) {
        color = "emerald";
      } else if (label.includes("quiz") || label.includes("submission")) {
        color = "blue";
      } else if (label.includes("faculty") || label.includes("review")) {
        color = "orange";
      }

      return {
        text: label.charAt(0).toUpperCase() + label.slice(1),
        time,
        color,
      };
    });
  }, [liveActivity]);

  const gradientCards = [
    {
      title: "Total Users",
      value: allUsers.length || stats.students + stats.faculty,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue",
      subtitle: `${stats.students} Students, ${stats.faculty} Faculty`,
    },
    {
      title: "Total Quizzes",
      value: stats.totalQuizzes,
      change: "+5%",
      trend: "up",
      icon: FileText,
      color: "purple",
      subtitle: `${stats.activeQuizzes} Active`,
    },
    {
      title: "Active Sessions",
      value: activeSessionsCount,
      change: isConnected ? "Live" : "Offline",
      trend: isConnected ? "up" : "neutral",
      icon: Activity,
      color: "orange",
      subtitle: "Last 10 minutes",
    },
    {
      title: "Universities",
      value: stats.universities,
      change: "0%",
      trend: "neutral",
      icon: School,
      color: "green",
      subtitle: "Partner Institutions",
    },
  ];

  // Secondary Metrics for quick glance
  const secondaryMetrics = [
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Published Quizzes",
      value: publishedQuizzesCount,
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Events (1h)",
      value: recentEventsCount,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Inactive Users",
      value: inactiveUsersCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  const timelineMeta = useMemo(() => {
    const days = 30;
    const labels = [];
    const keys = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      keys.push(key);
      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      );
    }

    return { days, labels, keys };
  }, []);

  const userGrowthSeries = useMemo(() => {
    const dailyCounts = new Map(timelineMeta.keys.map((k) => [k, 0]));

    allUsers.forEach((u) => {
      const createdAt = u?.createdAt ? new Date(u.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const dayKey = createdAt.toISOString().slice(0, 10);
      if (dailyCounts.has(dayKey)) {
        dailyCounts.set(dayKey, (dailyCounts.get(dayKey) || 0) + 1);
      }
    });

    let runningTotal = 0;
    return timelineMeta.keys.map((key) => {
      runningTotal += dailyCounts.get(key) || 0;
      return runningTotal;
    });
  }, [allUsers, timelineMeta]);

  const quizCreationSeries = useMemo(() => {
    const dailyCounts = new Map(timelineMeta.keys.map((k) => [k, 0]));

    allQuizzes.forEach((quiz) => {
      const createdAt = quiz?.createdAt ? new Date(quiz.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const dayKey = createdAt.toISOString().slice(0, 10);
      if (dailyCounts.has(dayKey)) {
        dailyCounts.set(dayKey, (dailyCounts.get(dayKey) || 0) + 1);
      }
    });

    return timelineMeta.keys.map((key) => dailyCounts.get(key) || 0);
  }, [allQuizzes, timelineMeta]);

  const dailyActivitySeries = useMemo(() => {
    const usersPerDay = new Map(timelineMeta.keys.map((k) => [k, new Set()]));
    const attemptsPerDay = new Map(timelineMeta.keys.map((k) => [k, 0]));

    liveActivity.forEach((activity) => {
      const timestamp = activity?.timestamp
        ? new Date(activity.timestamp)
        : null;
      if (!timestamp || Number.isNaN(timestamp.getTime())) return;
      const dayKey = timestamp.toISOString().slice(0, 10);
      if (!usersPerDay.has(dayKey)) return;

      const actorId =
        activity?.studentId ||
        activity?.user?._id ||
        activity?.userId ||
        activity?.studentEmail ||
        activity?.studentName;

      if (actorId) {
        usersPerDay.get(dayKey).add(String(actorId));
      }

      const typeLabel = String(
        activity?.type || activity?.normalizedType || "",
      ).toUpperCase();
      if (
        typeLabel.includes("SUBMISSION") ||
        typeLabel.includes("QUIZ") ||
        typeLabel.includes("ATTEMPT")
      ) {
        attemptsPerDay.set(dayKey, (attemptsPerDay.get(dayKey) || 0) + 1);
      }
    });

    const activeUsers = timelineMeta.keys.map(
      (key) => usersPerDay.get(key).size,
    );
    const quizAttempts = timelineMeta.keys.map(
      (key) => attemptsPerDay.get(key) || 0,
    );

    return { activeUsers, quizAttempts };
  }, [liveActivity, timelineMeta]);

  const downloadCSV = (data, filename) => {
    if (!data.length) return toast.error("No data to export");
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((v) => (typeof v === "object" ? "..." : v))
        .join(","),
    );
    const csv = [headers, ...rows].join("\n");
    const url = window.URL.createObjectURL(
      new Blob([csv], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  };

  return (
    <div className="dashboard-container flex min-h-screen font-sans pt-[72px]">
      <LandingNavbar
        hideDefaultLinks
        centerContent={
          <div className="flex items-center gap-2 min-w-max">
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabNavigation(item)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                      : "bg-white/60 text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700"
                  }`}
                >
                  <Icon
                    size={16}
                    className={isActive ? "text-emerald-600" : "text-slate-500"}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        }
      />

      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeTab}
        onNavigate={handleTabNavigation}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="lg:hidden mb-4">
                  <HamburgerMenu
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    variant="outline"
                    size="md"
                    showLabel={true}
                  />
                </div>
                <h1 className="text-3xl md:text-5xl font-[900] tracking-tight bg-gradient-to-r from-slate-950 via-indigo-900 to-slate-900 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.firstName || "Admin"}! 👋
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-slate-500 font-semibold text-sm">
                    Platform command center & real-time monitoring
                  </p>
                  {lastUpdatedAt && (
                    <p className="text-xs text-slate-400 font-semibold">
                      Synced {lastUpdatedAt.toLocaleTimeString()}
                    </p>
                  )}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                      isConnected
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-[0_2px_15px_rgba(16,185,129,0.15)]"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    } transition-all duration-500 backdrop-blur-md`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                    />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                      {isConnected ? "Real-time Live" : "Offline Mode"}
                    </span>
                  </motion.div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={() => navigate("/create-quiz")}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold shadow-[0_15px_30px_rgba(79,70,229,0.25)]"
                >
                  <Plus size={20} strokeWidth={3} />
                  <span>Create Quiz</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => downloadCSV(allUsers, "dashboard-export.csv")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/70 backdrop-blur-xl border border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-indigo-300 hover:bg-white transition-all shadow-sm"
                >
                  <Download size={18} strokeWidth={2.5} />
                  <span>Export Report</span>
                </motion.button>
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-8 pb-10">
                {/* Main Dashboard Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Left Section: Metrics & Stats (8/12) */}
                  <div className="lg:col-span-8 space-y-8 flex flex-col">
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
                            color={sm.color
                              .replace("text-", "")
                              .replace("-600", "")}
                            delay={i}
                          />
                        ))
                      )}
                    </motion.div>

                    {/* Primary Stat Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                      {loading ? (
                        <SkeletonLoader type="stat-card" count={4} />
                      ) : (
                        gradientCards.map((stat, idx) => (
                          <ModernStatCard
                            key={stat.title}
                            {...stat}
                            delay={idx}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Section: Live Intelligence Feed (4/12) */}
                  <div className="lg:col-span-4">
                    <motion.div
                      variants={itemVariants}
                      className="bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/60 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col h-full sticky top-4 max-h-[600px]"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 shadow-inner">
                            <Activity className="h-5 w-5 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 tracking-tight text-lg">
                              Live Feed
                            </h3>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                                Monitoring
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                        {liveActivity.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
                            <div className="p-5 bg-slate-100 rounded-full mb-4">
                              <Zap className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                              Systems Ready
                              <br />
                              <span className="font-medium normal-case text-[10px]">
                                Awaiting platform events...
                              </span>
                            </p>
                          </div>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            {liveActivity.map((act, idx) => (
                              <motion.div
                                key={act.timestamp + idx}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                className="p-4 bg-white/70 border border-white/90 rounded-2xl flex gap-4 group hover:border-indigo-200 hover:bg-white transition-all shadow-[0_5px_15px_rgba(0,0,0,0.02)] cursor-default"
                              >
                                <div
                                  className={`p-3.5 rounded-2xl shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.05)] ${
                                    act.type?.includes("QUIZ")
                                      ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
                                      : act.type?.includes("USER")
                                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                                        : act.type?.includes("FACULTY")
                                          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                                          : "bg-gradient-to-br from-slate-500 to-slate-700 text-white"
                                  }`}
                                >
                                  {act.type?.includes("QUIZ") ? (
                                    <BookOpen size={20} />
                                  ) : act.type?.includes("USER") ? (
                                    <Users size={20} />
                                  ) : act.type?.includes("FACULTY") ? (
                                    <UserCheck size={20} />
                                  ) : (
                                    <Zap size={20} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                      {act.type?.replace(/_/g, " ")}
                                    </p>
                                    <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded-md">
                                      {new Date(
                                        act.timestamp,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-900 line-clamp-1 leading-tight mb-1">
                                    {act.user?.firstName
                                      ? `${act.user.firstName} ${act.user.lastName}`
                                      : act.quiz?.title || "Platform Event"}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium italic">
                                    {act.type?.includes("REGISTER")
                                      ? "New account established"
                                      : act.type?.includes("PUBLISHED")
                                        ? "Live exam initiated"
                                        : act.type?.includes("REVIEW")
                                          ? `Application ${act.action}d`
                                          : "Platform telemetry received"}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>

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
                        <h3 className="text-xl font-bold text-slate-900">
                          Recent Quizzes
                        </h3>
                        <p className="text-sm text-slate-600">
                          Latest quizzes from all faculty
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("quizzes")}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      View All →
                    </button>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                        >
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
                      <p className="text-slate-600 font-medium">
                        No quizzes available yet
                      </p>
                      <p className="text-sm text-slate-500 mb-4">
                        Create your first quiz to get started
                      </p>
                      <button
                        onClick={() => navigate("/create-quiz")}
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
                          <div
                            className={`p-3 rounded-lg ${
                              quiz.status === "published"
                                ? "bg-emerald-100"
                                : quiz.status === "draft"
                                  ? "bg-slate-200"
                                  : "bg-orange-100"
                            }`}
                          >
                            <BookOpen
                              className={`h-6 w-6 ${
                                quiz.status === "published"
                                  ? "text-emerald-600"
                                  : quiz.status === "draft"
                                    ? "text-slate-600"
                                    : "text-orange-600"
                              }`}
                            />
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
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  quiz.status === "published"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : quiz.status === "draft"
                                      ? "bg-slate-200 text-slate-700"
                                      : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {quiz.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(quiz.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
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
                        labels={timelineMeta.labels}
                        datasets={[
                          {
                            label: "Total Users",
                            data: userGrowthSeries,
                            borderColor: "rgb(99, 102, 241)",
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointBackgroundColor: "rgb(99, 102, 241)",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                          },
                        ]}
                        height={350}
                        timeframe="Last 30 days"
                      />

                      <AnimatedLineChart
                        title="Quiz Creation Timeline"
                        subtitle="New quizzes created daily"
                        labels={timelineMeta.labels}
                        datasets={[
                          {
                            label: "Quizzes Created",
                            data: quizCreationSeries,
                            borderColor: "rgb(168, 85, 247)",
                            backgroundColor: "rgba(168, 85, 247, 0.1)",
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            pointBackgroundColor: "rgb(168, 85, 247)",
                            pointBorderColor: "#fff",
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
                    labels={timelineMeta.labels}
                    dataset1={{
                      label: "Active Users",
                      data: dailyActivitySeries.activeUsers,
                      borderColor: "rgb(16, 185, 129)",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                    }}
                    dataset2={{
                      label: "Quiz Attempts",
                      data: dailyActivitySeries.quizAttempts,
                      borderColor: "rgb(251, 146, 60)",
                      backgroundColor: "rgba(251, 146, 60, 0.1)",
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
                        labels={quizSubjectDistribution.labels}
                        data={quizSubjectDistribution.data}
                        colorScheme="indigo"
                        height={350}
                      />

                      <AnimatedDoughnutChart
                        title="Quiz Status Distribution"
                        subtitle="Current quiz lifecycle stages"
                        labels={["Active", "Closed", "Draft"]}
                        data={[
                          stats.activeQuizzes,
                          stats.completedQuizzes,
                          Math.max(
                            0,
                            stats.totalQuizzes -
                              (stats.activeQuizzes + stats.completedQuizzes),
                          ),
                        ]}
                        colors={[
                          "rgba(34, 197, 94, 0.8)",
                          "rgba(239, 68, 68, 0.8)",
                          "rgba(156, 163, 175, 0.8)",
                        ]}
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
                            key: "firstName",
                            label: "Name",
                            sortable: true,
                            render: (_, row) => (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-sm">
                                  {row.firstName?.[0]}
                                  {row.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {row.firstName} {row.lastName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {row.email}
                                  </p>
                                </div>
                              </div>
                            ),
                          },
                          {
                            key: "role",
                            label: "Role",
                            sortable: true,
                            render: (role) => (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                  role === "admin"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : role === "faculty"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {role}
                              </span>
                            ),
                          },
                          {
                            key: "isActive",
                            label: "Status",
                            render: (isActive) => (
                              <span
                                className={`inline-flex items-center gap-2 text-xs font-semibold ${
                                  isActive
                                    ? "text-emerald-700"
                                    : "text-slate-500"
                                }`}
                              >
                                <span
                                  className={`badge-dot ${isActive ? "badge-dot-success" : "badge-dot-danger"}`}
                                />
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            ),
                          },
                          {
                            key: "createdAt",
                            label: "Joined",
                            sortable: true,
                            render: (date) => (
                              <span className="text-sm text-slate-600">
                                {new Date(date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            ),
                          },
                        ]}
                        searchable={true}
                        onExport={(data) => downloadCSV(data, "users.csv")}
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
                      <h3 className="font-bold text-lg text-slate-800">
                        System Health
                      </h3>
                      <span className="badge-dot badge-dot-success"></span>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">
                            Active Quiz Ratio
                          </span>
                          <span className="font-bold text-emerald-600">
                            {stats.totalQuizzes
                              ? `${Math.round((stats.activeQuizzes / stats.totalQuizzes) * 100)}%`
                              : "0%"}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{
                              width: stats.totalQuizzes
                                ? `${Math.round((stats.activeQuizzes / stats.totalQuizzes) * 100)}%`
                                : "0%",
                            }}
                            transition={{ duration: 1, delay: 0.5 }}
                            style={{
                              background:
                                "linear-gradient(90deg, #10b981, #059669)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">
                            Published Quizzes
                          </span>
                          <span className="font-bold text-blue-600">
                            {stats.totalQuizzes
                              ? `${Math.round((publishedQuizzesCount / stats.totalQuizzes) * 100)}%`
                              : "0%"}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{
                              width: stats.totalQuizzes
                                ? `${Math.round((publishedQuizzesCount / stats.totalQuizzes) * 100)}%`
                                : "0%",
                            }}
                            transition={{ duration: 1, delay: 0.6 }}
                            style={{
                              background:
                                "linear-gradient(90deg, #3b82f6, #2563eb)",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">
                            Draft Quizzes
                          </span>
                          <span className="font-bold text-orange-600">
                            {stats.totalQuizzes
                              ? `${Math.round((draftQuizzesCount / stats.totalQuizzes) * 100)}%`
                              : "0%"}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{
                              width: stats.totalQuizzes
                                ? `${Math.round((draftQuizzesCount / stats.totalQuizzes) * 100)}%`
                                : "0%",
                            }}
                            transition={{ duration: 1, delay: 0.7 }}
                            style={{
                              background:
                                "linear-gradient(90deg, #f59e0b, #d97706)",
                            }}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 mt-6">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-500" />
                          Recent Activity
                        </h4>
                        <div className="space-y-3">
                          {(activityFeedSummary.length
                            ? activityFeedSummary
                            : [
                                {
                                  text: "Awaiting live platform events",
                                  time: "live",
                                  color: "blue",
                                },
                              ]
                          ).map((activity, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 + 0.8 }}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <div
                                className={`badge-dot badge-dot-${activity.color} mt-1.5`}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800">
                                  {activity.text}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {activity.time}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === "faculty-requests" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FacultyRequestsPanel />
              </motion.div>
            )}

            {activeTab === "universities" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <UniversitiesPanel />
              </motion.div>
            )}

            {activeTab === "system-settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <SystemSettingsPanel />
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200"
              >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">
                    User Management
                  </h2>
                  <button
                    onClick={() => downloadCSV(allUsers, "all_users.csv")}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    Download CSV
                  </button>
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
                      {allUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs uppercase font-semibold ${
                                user.role === "admin"
                                  ? "bg-red-50 text-red-700"
                                  : user.role === "faculty"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-green-50 text-green-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-slate-400 hover:text-indigo-600">
                              <Settings size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "quizzes" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200"
              >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">
                    All Quizzes
                  </h2>
                  <button
                    onClick={() => downloadCSV(allQuizzes, "all_quizzes.csv")}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    Download CSV
                  </button>
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
                      {allQuizzes.map((quiz) => (
                        <tr key={quiz._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium">
                            {quiz.title}
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-500">
                            {quiz.accessCode}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                quiz.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : quiz.status === "published"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {quiz.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {quiz.totalQuestions || quiz.questions?.length || 0}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {quiz.createdBy?.firstName || "Unknown"}
                          </td>
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
