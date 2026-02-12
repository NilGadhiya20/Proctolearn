import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useRealtimeAttempts = (quizId, enabled = true) => {
  const [submissions, setSubmissions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!enabled || !quizId) return;

    const newSocket = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Real-time socket connected');
      // Join faculty monitoring room
      newSocket.emit('join-quiz', { quizId, role: 'faculty' });
    });

    newSocket.on('activity-logged', (data) => {
      console.log('Activity logged:', data);
      // Add to activity feed
      setActivityFeed(prev => [data, ...prev].slice(0, 50)); // Keep last 50
      
      // Update submission status if exists
      setSubmissions(prev => prev.map(sub => {
        if (sub._id === data.submissionId) {
          return {
            ...sub,
            lastActivity: new Date(),
            activityCount: (sub.activityCount || 0) + 1
          };
        }
        return sub;
      }));
    });

    newSocket.on('alert', (data) => {
      console.log('Alert received:', data);
      setAlerts(prev => [data, ...prev].slice(0, 20)); // Keep last 20 alerts
      
      // Update submission risk
      setSubmissions(prev => prev.map(sub => {
        if (sub._id === data.submissionId) {
          return {
            ...sub,
            riskLevel: data.severity,
            suspicionScore: data.score,
            lastAlert: new Date()
          };
        }
        return sub;
      }));
    });

    newSocket.on('dashboard-activity', (data) => {
      setActivityFeed(prev => [data, ...prev].slice(0, 50));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [quizId, enabled]);

  // Emit activity for current monitoring session
  const emitActivity = useCallback((submissionId, studentId, activityType, details = {}) => {
    if (socket && socket.connected) {
      socket.emit('activity', {
        submissionId,
        quizId,
        activityType,
        studentId,
        details
      });
    }
  }, [socket, quizId]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Clear activity feed
  const clearActivityFeed = useCallback(() => {
    setActivityFeed([]);
  }, []);

  return {
    submissions,
    setSubmissions,
    alerts,
    clearAlerts,
    activityFeed,
    clearActivityFeed,
    emitActivity,
    socket
  };
};

export default useRealtimeAttempts;
