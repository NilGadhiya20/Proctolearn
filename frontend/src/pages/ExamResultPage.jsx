import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Home, Download } from 'lucide-react';
import AnimatedLoader from '../components/Common/AnimatedLoader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ExamResultPage = () => {
  const { quizId, sessionId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/quizzes/exam/${sessionId}/details`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        setResult(response.data.data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load result';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AnimatedLoader message="Loading your results" size="large" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Results</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load exam results'}</p>
          <button
            onClick={() => navigate('/available-quizzes')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const isPassed = result.obtainedMarks >= result.quiz.passingMarks;
  const percentage = result.percentage.toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Result Header */}
        <div
          className={`rounded-2xl shadow-2xl p-8 mb-8 text-center ${
            isPassed ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-pink-50'
          }`}
        >
          {isPassed ? (
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
          )}

          <h1 className={`text-4xl font-bold mb-2 ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
            {isPassed ? 'Congratulations!' : 'Not Passed'}
          </h1>
          <p className={`text-lg ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
            {isPassed ? 'You have passed the exam!' : 'You will need to attempt again.'}
          </p>
        </div>

        {/* Detailed Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Score Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Score</h2>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={isPassed ? '#10b981' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${(percentage / 100) * 565} 565`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {percentage}%
                  </span>
                  <span className="text-sm text-gray-600 mt-1">Percentage</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">{result.obtainedMarks}</span> out of{' '}
                <span className="font-semibold text-gray-800">{result.totalMarks}</span> marks
              </p>
              <p className="text-sm text-gray-600">
                Passing marks: <span className="font-semibold">{result.quiz.passingMarks}</span>
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Exam Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Exam Title</span>
                <span className="font-semibold text-gray-800">{result.quiz.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-semibold text-gray-800">{result.answers?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Time Spent</span>
                <span className="font-semibold text-gray-800">
                  {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Submitted At</span>
                <span className="font-semibold text-gray-800">
                  {new Date(result.endTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Summary */}
        {result.securityFlags && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{result.securityFlags.tabSwitches}</p>
                <p className="text-sm text-blue-700 mt-2">Tab Switches</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-600">{result.securityFlags.rightClickAttempts}</p>
                <p className="text-sm text-orange-700 mt-2">Right Clicks</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{result.securityFlags.copyPasteAttempts}</p>
                <p className="text-sm text-yellow-700 mt-2">Copy/Paste</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{result.isFullscreenMaintained ? '✓' : '✗'}</p>
                <p className="text-sm text-green-700 mt-2">Fullscreen</p>
              </div>
            </div>
          </div>
        )}

        {/* Answer Review */}
        {result.answers && result.answers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Answer Review</h2>
            <div className="space-y-4">
              {result.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    answer.isCorrect
                      ? 'bg-green-50 border-green-600'
                      : 'bg-red-50 border-red-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 mb-2">
                        Question {index + 1}
                      </p>
                      <p className={`text-sm ${answer.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        Your answer: <strong>{answer.selectedOption}</strong>
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-sm text-green-800 mt-1">
                          Marks obtained: <strong>{answer.marksObtained}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/available-quizzes')}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Quizzes
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Result
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResultPage;
