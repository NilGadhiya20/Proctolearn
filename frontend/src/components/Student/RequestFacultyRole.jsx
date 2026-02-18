import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, CheckCircle, XCircle, AlertCircle, Award, FileText, BarChart3, BookOpen, Target, User, Settings, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../context/themeContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../context/store';
import DashboardSidebar from '../Layout/DashboardSidebar';
import ThemeToggle from '../Common/ThemeToggle';

const RequestFacultyRole = () => {
  const { isDark } = useThemeContext();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    qualifications: ''
  });

  useEffect(() => {
    if (user && user.facultyRequest) {
      setExistingRequest(user.facultyRequest);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason.trim() || !formData.qualifications.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/auth/request-faculty', formData);
      
      if (response.data.success) {
        toast.success('Faculty role request submitted successfully!');
        setExistingRequest(response.data.data);
        setFormData({ reason: '', qualifications: '' });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return isDark 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' 
          : 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'approved':
        return isDark 
          ? 'bg-green-900/30 text-green-400 border-green-700' 
          : 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return isDark 
          ? 'bg-red-900/30 text-red-400 border-red-700' 
          : 'bg-red-100 text-red-700 border-red-300';
      default:
        return isDark 
          ? 'bg-slate-800 text-slate-400 border-slate-700' 
          : 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Student sidebar navigation items
  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', id: 'dashboard', action: () => navigate('/student/dashboard') },
    { icon: BookOpen, label: 'Available Quizzes', id: 'quizzes', action: () => navigate('/available-quizzes') },
    { icon: Award, label: 'My Results', id: 'results' },
    { icon: Target, label: 'Progress', id: 'progress' },
    { icon: UserCheck, label: 'Request Faculty Role', id: 'request-faculty' },
    { icon: User, label: 'Profile', id: 'profile', action: () => navigate('/profile') },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ];

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
    }
    setSidebarOpen(false);
  };

  // If user is already faculty or admin
  if (user && (user.role === 'faculty' || user.role === 'admin')) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-white to-slate-50'}`}>
        {/* Sidebar */}
        <DashboardSidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onItemClick={handleNavigation}
          currentPage="request-faculty"
        />

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          {/* Header */}
          <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
            isDark 
              ? 'bg-slate-900/80 border-slate-700' 
              : 'bg-white/80 border-slate-200'
          }`}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`lg:hidden p-2 rounded-xl transition-colors ${
                    isDark 
                      ? 'hover:bg-slate-800 text-slate-300' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    Request Faculty Role
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Welcome, {user?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={logout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className={`p-6 rounded-xl border-2 text-center ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-green-500' : 'text-green-600'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  You're Already a {user.role === 'admin' ? 'Administrator' : 'Faculty Member'}!
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  You have {user.role} privileges and can access all the features.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-white to-slate-50'}`}>
      {/* Sidebar */}
      <DashboardSidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onItemClick={handleNavigation}
        currentPage="request-faculty"
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          isDark 
            ? 'bg-slate-900/80 border-slate-700' 
            : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Request Faculty Role
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Welcome, {user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={logout}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-600' : 'bg-emerald-500'}`}>
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Request Faculty Role
            </h2>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Submit a request to become a faculty member. Admins will review your qualifications and approve or reject your request.
            </p>
          </div>
        </div>
      </div>

      {/* Existing Request Status */}
      {existingRequest && existingRequest.status !== 'none' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border-2 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-start gap-4 mb-4">
            <StatusIcon status={existingRequest.status} />
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Your Request Status
              </h3>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(existingRequest.status)}`}>
                {existingRequest.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Requested On:
              </p>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {new Date(existingRequest.requestedAt).toLocaleString()}
              </p>
            </div>

            {existingRequest.status === 'rejected' && existingRequest.rejectionReason && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                  Rejection Reason:
                </p>
                <p className={`${isDark ? 'text-red-300' : 'text-red-600'}`}>
                  {existingRequest.rejectionReason}
                </p>
              </div>
            )}

            {existingRequest.status === 'approved' && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <p className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  🎉 Congratulations! Your request has been approved. Please log out and log back in to access faculty features.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Request Form - Only show if no pending request */}
      {(!existingRequest || existingRequest.status === 'rejected' || existingRequest.status === 'none') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-xl border-2 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <FileText className="w-4 h-4" />
                Reason for Request *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explain why you want to become a faculty member..."
                rows={4}
                required
                className={`w-full p-3 rounded-xl border-2 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-emerald-600' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                } focus:outline-none resize-none transition-colors`}
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Award className="w-4 h-4" />
                Your Qualifications *
              </label>
              <textarea
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="List your educational background, experience, certifications, etc..."
                rows={6}
                required
                className={`w-full p-3 rounded-xl border-2 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-emerald-600' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                } focus:outline-none resize-none transition-colors`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-white text-lg
                flex items-center justify-center gap-2
                transition-all duration-200
                ${submitting 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  Submit Faculty Request
                </>
              )}
            </button>
          </form>

          {/* Info Note */}
          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>Note:</strong> Once submitted, your request will be reviewed by an administrator. 
              You'll be notified when a decision is made. Please provide accurate and detailed information 
              to increase your chances of approval.
            </p>
          </div>
        </motion.div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestFacultyRole;
