import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, Award, BookOpen } from 'lucide-react';
import { getAllQuizzes } from '../services/quizService';
import toast from 'react-hot-toast';
import Header from '../components/Layout/Header';

const AvailableQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getAllQuizzes({ status: 'published' });
      
      if (response.success) {
        setQuizzes(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 pt-14 sm:pt-16 md:pt-20 pb-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Available Quizzes</h1>
              <p className="text-sm sm:text-base text-gray-600">Select a quiz to start your attempt</p>
            </div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 px-4 py-2 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-colors font-semibold text-sm sm:text-base"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          </motion.div>

          {/* Quiz Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading available quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center"
            >
              <BookOpen className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Quizzes Available</h3>
              <p className="text-sm sm:text-base text-gray-600">Check back later for new assignments from your faculty</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                >
                  <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
                    <div className="mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{quiz.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                        {quiz.description || 'No description provided'}
                      </p>
                    </div>

                    {(quiz.subject || quiz.chapter) && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {quiz.subject && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            {quiz.subject}
                          </span>
                        )}
                        {quiz.chapter && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            {quiz.chapter}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-semibold text-gray-900">{quiz.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Marks</p>
                          <p className="text-sm font-semibold text-gray-900">{quiz.totalMarks}</p>
                        </div>
                      </div>
                    </div>

                    {quiz.proctoring?.enabled && (
                      <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                        <p className="text-xs text-teal-700 font-medium">
                          🔒 This quiz has proctoring enabled
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleStartQuiz(quiz._id)}
                      className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Play size={18} />
                      Start Quiz
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AvailableQuizzes;
