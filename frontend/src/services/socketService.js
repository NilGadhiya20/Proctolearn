import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinQuiz = (submissionId, quizId, studentId) => {
  const sock = getSocket();
  sock.emit('join-quiz', { submissionId, quizId, studentId });
};

export const emitTabSwitch = ({ submissionId, quizId, studentId, institutionId }) => {
  const sock = getSocket();
  sock.emit('tabSwitch', { submissionId, quizId, studentId, institutionId });
};

export const emitFullscreenExit = ({ submissionId, quizId, studentId, institutionId }) => {
  const sock = getSocket();
  sock.emit('fullscreenExit', { submissionId, quizId, studentId, institutionId });
};

export const emitQuizLeft = ({ submissionId, quizId, studentId, institutionId }) => {
  const sock = getSocket();
  sock.emit('quizLeft', { submissionId, quizId, studentId, institutionId });
};

export const logActivity = (submissionId, quizId, activityType, details, studentId, institutionId) => {
  const sock = getSocket();
  sock.emit('activity', {
    submissionId,
    quizId,
    activityType,
    details,
    studentId,
    institutionId
  });
};

export const notifyVisibilityChange = (submissionId, isVisible, studentId, quizId, institutionId) => {
  const sock = getSocket();
  sock.emit('visibility-change', {
    submissionId,
    isVisible,
    studentId,
    quizId,
    institutionId
  });
};

export const submitQuiz = (submissionId, quizId, answers, studentId) => {
  const sock = getSocket();
  sock.emit('submit-quiz', {
    submissionId,
    quizId,
    answers,
    studentId
  });
};

export const triggerAutoSubmit = ({ submissionId, quizId, studentId, reason }) => {
  const sock = getSocket();
  sock.emit('auto-submit', {
    submissionId,
    quizId,
    studentId,
    reason
  });
};

export const onActivityLogged = (callback) => {
  const sock = getSocket();
  sock.on('activity-logged', callback);
};

export const offActivityLogged = (callback) => {
  const sock = getSocket();
  sock.off('activity-logged', callback);
};

export const onAlert = (callback) => {
  const sock = getSocket();
  sock.on('alert', callback);
};

export const offAlert = (callback) => {
  const sock = getSocket();
  sock.off('alert', callback);
};

export const onSubmissionComplete = (callback) => {
  const sock = getSocket();
  sock.on('submission-complete', callback);
};

export const onStudentJoined = (callback) => {
  const sock = getSocket();
  sock.on('studentJoined', callback);
};

export const offStudentJoined = (callback) => {
  const sock = getSocket();
  sock.off('studentJoined', callback);
};

export const onTabSwitchDetected = (callback) => {
  const sock = getSocket();
  sock.on('tabSwitchDetected', callback);
};

export const offTabSwitchDetected = (callback) => {
  const sock = getSocket();
  sock.off('tabSwitchDetected', callback);
};

export const onFullscreenExitDetected = (callback) => {
  const sock = getSocket();
  sock.on('fullscreenExitDetected', callback);
};

export const offFullscreenExitDetected = (callback) => {
  const sock = getSocket();
  sock.off('fullscreenExitDetected', callback);
};

export const onQuizLeft = (callback) => {
  const sock = getSocket();
  sock.on('quizLeft', callback);
};

export const offQuizLeft = (callback) => {
  const sock = getSocket();
  sock.off('quizLeft', callback);
};

export const onError = (callback) => {
  const sock = getSocket();
  sock.on('error', callback);
};

export const offError = (callback) => {
  const sock = getSocket();
  sock.off('error', callback);
};

export const onTimerUpdate = (callback) => {
  const sock = getSocket();
  sock.on('timer-update', callback);
};

export const offTimerUpdate = (callback) => {
  const sock = getSocket();
  sock.off('timer-update', callback);
};
