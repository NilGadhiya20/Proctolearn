import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Clock, AlertCircle, FileCheck, Lock } from 'lucide-react';
import { useAuthStore } from '../../context/store';
import AnimatedLoader from '../components/Common/AnimatedLoader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SecureExamPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State Management
  const [examStarted, setExamStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState({
    tabSwitches: 0,
    rightClickAttempts: 0,
    copyPasteAttempts: 0
  });

  const proctoringEnabled = quizData?.proctoring?.enabled ?? true;
  const allowTabSwitching = quizData?.proctoring?.allowTabSwitching ?? false;
  const shouldDetectTabSwitch = proctoringEnabled && !allowTabSwitching;

  // Refs
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const visibilityRef = useRef(true);
  const autoSubmitTriggeredRef = useRef(false);
  const lastTabEventAtRef = useRef(0);

  const MAX_TAB_SWITCHES = 3;
  const MAX_COPY_PASTE_ALERTS = 3;

  // Initialize Exam Session
  const initializeExam = useCallback(async () => {
    try {
      // Start exam session
      const sessionResponse = await axios.post(
        `${API_URL}/quizzes/${quizId}/exam/start`,
        {
          browser: navigator.userAgent
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      const { sessionId: newSessionId, quizDetails } = sessionResponse.data.data;
      setSessionId(newSessionId);
      setQuizData(quizDetails);
      setTimeLeft(quizDetails.duration * 60); // Convert to seconds

      // Get quiz questions
      const quizResponse = await axios.get(
        `${API_URL}/quizzes/${quizId}/attempt`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setQuestions(quizResponse.data.data.questions || []);
      setExamStarted(true);

      // Request fullscreen
      requestFullscreen();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start exam');
      navigate('/available-quizzes');
    }
  }, [quizId, navigate]);

  // Request Fullscreen
  const requestFullscreen = async () => {
    try {
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      toast.error('Fullscreen is required to take the exam');
    }
  };

  // Timer Effect
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [examStarted, timeLeft]);

  // Auto Submit When Time Ends
  const handleAutoSubmit = useCallback(async () => {
    if (!sessionId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const submissionData = Object.entries(answers).map(([qId, answer]) => ({
        questionId: qId,
        selectedOption: answer
      }));

      await axios.post(
        `${API_URL}/quizzes/exam/${sessionId}/auto-submit`,
        { answers: submissionData },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Exam auto-submitted');
      navigate('/student/dashboard');
    } catch (error) {
      toast.error('Failed to auto-submit exam');
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, answers, navigate, isSubmitting]);

  const registerSuspiciousActivity = useCallback((activityType) => {
    if (!examStarted) {
      return;
    }

    toast.error(`${activityType} detected`);
  }, [examStarted]);

  // Security: Disable Right Click
  useEffect(() => {
    if (!examStarted) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      registerSuspiciousActivity('Right-click');
      setSecurityWarnings(prev => ({
        ...prev,
        rightClickAttempts: prev.rightClickAttempts + 1
      }));

      if (sessionId) {
        axios.post(
          `${API_URL}/quizzes/exam/${sessionId}/log-event`,
          { eventType: 'right-click' },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        ).catch(err => console.error('Failed to log security event:', err));
      }

      toast.error('Right-click is disabled during exam');
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [examStarted, sessionId, registerSuspiciousActivity]);

  // Security: Disable Copy/Paste
  useEffect(() => {
    if (!examStarted) return;

    const notifyCopyPasteAttempt = (type) => {
      registerSuspiciousActivity('Copy/paste');

      setSecurityWarnings(prev => {
        const nextCount = prev.copyPasteAttempts + 1;

        if (nextCount <= MAX_COPY_PASTE_ALERTS) {
          toast.error(`Copy/paste is disabled (${nextCount}/${MAX_COPY_PASTE_ALERTS})`);
        }

        return {
          ...prev,
          copyPasteAttempts: nextCount
        };
      });

      if (sessionId) {
        axios.post(
          `${API_URL}/quizzes/exam/${sessionId}/log-event`,
          { eventType: 'copy-paste', eventSource: type },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        ).catch(err => console.error('Failed to log security event:', err));
      }
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      notifyCopyPasteAttempt(e.type);
      return false;
    };

    const handleCopyPasteShortcut = (e) => {
      const isClipboardShortcut =
        (e.ctrlKey || e.metaKey) && ['c', 'x', 'v'].includes(e.key.toLowerCase());

      if (!isClipboardShortcut) {
        return;
      }

      e.preventDefault();
      notifyCopyPasteAttempt(`shortcut:${e.key.toLowerCase()}`);
    };

    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('keydown', handleCopyPasteShortcut);

    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('keydown', handleCopyPasteShortcut);
    };
  }, [examStarted, sessionId, registerSuspiciousActivity]);

  // Security: Detect Tab Switch
  useEffect(() => {
    if (!examStarted || !shouldDetectTabSwitch) return;

    const registerTabSwitch = (source) => {
      const now = Date.now();
      if (now - lastTabEventAtRef.current < 800) {
        return;
      }
      lastTabEventAtRef.current = now;

      visibilityRef.current = false;
      setShowWarning(true);
      registerSuspiciousActivity('Tab switch');

      setSecurityWarnings(prev => {
        const nextCount = prev.tabSwitches + 1;

        if (nextCount <= MAX_TAB_SWITCHES) {
          toast.error(`Tab switch detected (${nextCount}/${MAX_TAB_SWITCHES})`);
        }

        if (nextCount >= MAX_TAB_SWITCHES && !autoSubmitTriggeredRef.current) {
          autoSubmitTriggeredRef.current = true;
          toast.error('3 tab switches detected. Exam is being auto-submitted.');
          handleAutoSubmit();
        }

        return {
          ...prev,
          tabSwitches: nextCount
        };
      });

      if (sessionId) {
        axios.post(
          `${API_URL}/quizzes/exam/${sessionId}/log-event`,
          { eventType: 'tab-switch', eventSource: source },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        ).catch(err => console.error('Failed to log security event:', err));
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerTabSwitch('visibility_hidden');
      } else {
        visibilityRef.current = true;
        setShowWarning(false);
      }
    };

    const handleWindowBlur = () => {
      registerTabSwitch('window_blur');
    };

    const handleTabShortcutAttempt = (e) => {
      const key = e.key?.toLowerCase();
      const isSystemSwitchAttempt =
        key === 'tab' && (e.altKey || e.ctrlKey || e.metaKey);

      if (isSystemSwitchAttempt) {
        // Browsers cannot fully block OS-level app switching, but we still record and warn.
        e.preventDefault();
        registerTabSwitch(`shortcut_${e.altKey ? 'alt' : e.ctrlKey ? 'ctrl' : 'meta'}_tab`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleTabShortcutAttempt, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleTabShortcutAttempt, true);
    };
  }, [examStarted, shouldDetectTabSwitch, sessionId, registerSuspiciousActivity, handleAutoSubmit]);

  // Security: Detect Fullscreen Exit
  useEffect(() => {
    if (!examStarted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        registerSuspiciousActivity('Fullscreen exit');
        toast.error('You have exited fullscreen. Please re-enter fullscreen mode.');
        requestFullscreen();

        if (sessionId) {
          axios.post(
            `${API_URL}/quizzes/exam/${sessionId}/log-event`,
            { eventType: 'fullscreen-exit' },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          ).catch(err => console.error('Failed to log security event:', err));
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [examStarted, sessionId, registerSuspiciousActivity]);

  // Security: Close/refresh attempt detection
  useEffect(() => {
    if (!examStarted) return;

    const handleBeforeUnload = (e) => {
      registerSuspiciousActivity('Window close/refresh attempt');

      if (sessionId) {
        const payload = JSON.stringify({ eventType: 'window-close-attempt' });
        navigator.sendBeacon(`${API_URL}/quizzes/exam/${sessionId}/log-event`, payload);
      }

      e.preventDefault();
      e.returnValue = 'Leaving will be treated as suspicious activity.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted, sessionId, registerSuspiciousActivity]);

  // Format Time Display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Answer Selection
  const handleSelectAnswer = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Handle Option Change
  const handleOptionChange = (questionId, option) => {
    handleSelectAnswer(questionId, option);
  };

  // Submit Exam
  const handleSubmitExam = async () => {
    if (!window.confirm('Are you sure you want to submit the exam? You cannot change your answers after submission.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submissionData = Object.entries(answers).map(([qId, answer]) => ({
        questionId: qId,
        selectedOption: answer
      }));

      await axios.post(
        `${API_URL}/quizzes/exam/${sessionId}/submit`,
        { answers: submissionData },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Exam submitted successfully!');
      navigate(`/quiz/${quizId}/exam/result/${sessionId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Exam Screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Secure Exam</h1>
            <p className="text-gray-600">Start your online exam with monitoring</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="border-l-4 border-indigo-600 pl-4 py-2">
              <h3 className="font-semibold text-gray-800 mb-2">Security Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Fullscreen mode required</li>
                <li>✓ Right-click disabled</li>
                <li>✓ Copy/Paste disabled</li>
                <li>{shouldDetectTabSwitch ? '✓ Tab switching detected' : '✓ Tab switching allowed by quiz settings'}</li>
                <li>✓ Auto-submit on time end</li>
                <li>✓ Activity monitoring enabled</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your screen activity will be monitored. Multiple suspicious activities may result in exam cancellation.
              </p>
            </div>
          </div>

          <button
            onClick={initializeExam}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // Exam In Progress Screen
  if (!quizData || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedLoader message="Loading exam" size="large" />
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const timeWarning = timeLeft < 300; // Show warning if less than 5 minutes

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
    >
      {/* Tab Switch Warning */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle className="w-5 h-5" />
          <span>You switched to another tab. Activity recorded.</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{quizData.title}</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className={`text-right p-4 rounded-lg ${timeWarning ? 'bg-red-50' : 'bg-indigo-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-6 h-6 ${timeWarning ? 'text-red-600' : 'text-indigo-600'}`} />
                <span className={`text-2xl font-bold ${timeWarning ? 'text-red-600' : 'text-indigo-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              {timeWarning && <p className="text-sm text-red-600">Time running out!</p>}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{question.questionText}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="block p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option.text}
                  checked={answers[question._id] === option.text}
                  onChange={() => handleOptionChange(question._id, option.text)}
                  className="w-4 h-4 text-indigo-600 cursor-pointer"
                />
                <span className="ml-4 text-gray-800 font-medium">{option.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Security Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{securityWarnings.tabSwitches}</p>
              <p className="text-xs text-red-700">Tab Switches</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{securityWarnings.rightClickAttempts}</p>
              <p className="text-xs text-orange-700">Right Clicks</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{securityWarnings.copyPasteAttempts}</p>
              <p className="text-xs text-yellow-700">Copy/Paste</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2 overflow-x-auto">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  idx === currentQuestion
                    ? 'bg-indigo-600 text-white'
                    : answers[_._id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <FileCheck className="w-5 h-5" />
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureExamPage;
