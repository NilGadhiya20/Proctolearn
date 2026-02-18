import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, UserX, Clock, CheckCircle, XCircle, Eye, 
  AlertCircle, User, Mail, Calendar, FileText, Award 
} from 'lucide-react';
import { useThemeContext } from '../../context/themeContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const FacultyRequestsPanel = () => {
  const { isDark } = useThemeContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [reviewAction, setReviewAction] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/auth/faculty-requests?status=${filter}`);
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching faculty requests:', error);
      toast.error('Failed to load faculty requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (userId, action, rejectionReason = '') => {
    try {
      await api.patch(`/auth/faculty-requests/${userId}`, {
        action,
        rejectionReason
      });
      
      toast.success(`Request ${action}d successfully!`);
      setShowDetailsModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  const openDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    setReviewAction(null);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-300',
      rejected: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-300'
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${colors[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Faculty Role Requests
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Review and approve faculty role requests from students
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-2 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${filter === tab
                  ? isDark 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'bg-emerald-500 text-white shadow-lg'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-48 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'}`}>
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            No {filter} requests
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            There are no {filter} faculty role requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${isDark 
                    ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-900/20' 
                    : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10'
                  }
                `}
                onClick={() => openDetails(request)}
              >
                {/* User Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                    {request.firstName?.[0]}{request.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {request.firstName} {request.lastName}
                    </h3>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {request.email}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <StatusBadge status={request.facultyRequest.status} />
                </div>

                {/* Request Info */}
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>Requested {new Date(request.facultyRequest.requestedAt).toLocaleDateString()}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <User className="w-4 h-4" />
                    <span>Current: {request.role}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className={`
                    mt-4 w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200
                    ${isDark 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }
                  `}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDetailsModal(false);
                setReviewAction(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className={`
                w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl
                ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}
              `}>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      Faculty Role Request
                    </h2>
                    <StatusBadge status={selectedRequest.facultyRequest.status} />
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setReviewAction(null);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* User Details */}
                <div className="space-y-4 mb-6">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl ${isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
                        {selectedRequest.firstName?.[0]}{selectedRequest.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {selectedRequest.firstName} {selectedRequest.lastName}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <Mail className="w-4 h-4 inline mr-2" />
                          {selectedRequest.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Current Role:
                        </span>
                        <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {selectedRequest.role.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Requested On:
                        </span>
                        <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {new Date(selectedRequest.facultyRequest.requestedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <FileText className="w-5 h-5" />
                      Reason for Request
                    </h4>
                    <p className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                      {selectedRequest.facultyRequest.reason}
                    </p>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Award className="w-5 h-5" />
                      Qualifications
                    </h4>
                    <p className={`p-4 rounded-xl ${isDark ? 'bg-slate-900/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                      {selectedRequest.facultyRequest.qualifications}
                    </p>
                  </div>

                  {/* Rejection Reason (if rejected) */}
                  {selectedRequest.facultyRequest.status === 'rejected' && selectedRequest.facultyRequest.rejectionReason && (
                    <div>
                      <h4 className={`font-semibold mb-2 flex items-center gap-2 text-red-500`}>
                        <AlertCircle className="w-5 h-5" />
                        Rejection Reason
                      </h4>
                      <p className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
                        {selectedRequest.facultyRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Only show if pending */}
                {selectedRequest.facultyRequest.status === 'pending' && (
                  <div className="space-y-4">
                    {reviewAction === null ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setReviewAction('approve')}
                          className="flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                        >
                          <UserCheck className="w-5 h-5" />
                          Approve Request
                        </button>
                        <button
                          onClick={() => setReviewAction('reject')}
                          className="flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
                        >
                          <UserX className="w-5 h-5" />
                          Reject Request
                        </button>
                      </div>
                    ) : reviewAction === 'approve' ? (
                      <div className="space-y-3">
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Are you sure you want to approve this faculty role request? This user will gain faculty privileges.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReview(selectedRequest._id, 'approve')}
                            className="flex-1 py-3 px-6 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                          >
                            Confirm Approval
                          </button>
                          <button
                            onClick={() => setReviewAction(null)}
                            className={`px-6 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className={`block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Rejection Reason (Required)
                        </label>
                        <textarea
                          id="rejection-reason"
                          rows={4}
                          placeholder="Provide a reason for rejecting this request..."
                          className={`w-full p-3 rounded-xl border-2 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} focus:border-red-500 focus:outline-none resize-none`}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const reason = document.getElementById('rejection-reason').value;
                              if (!reason.trim()) {
                                toast.error('Please provide a rejection reason');
                                return;
                              }
                              handleReview(selectedRequest._id, 'reject', reason);
                            }}
                            className="flex-1 py-3 px-6 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => setReviewAction(null)}
                            className={`px-6 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyRequestsPanel;
