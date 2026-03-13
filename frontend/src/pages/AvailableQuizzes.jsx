import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, Award, BookOpen } from 'lucide-react';
import { getAllQuizzes } from '../services/quizService';
import toast from 'react-hot-toast';
import Header from '../components/Layout/Header';
import AnimatedLoader from '../components/Common/AnimatedLoader';

const AvailableQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('🔄 AvailableQuizzes component render');
  console.log('   - Quizzes state:', quizzes);
  console.log('   - Quizzes count:', quizzes.length);
  
  // Log quizzes whenever they change
  useEffect(() => {
    console.log('📊 ===== QUIZZES STATE CHANGED =====');
    console.log('   Count:', quizzes.length);
    if (quizzes.length > 0) {
      console.log('   First quiz:', quizzes[0]);
      console.log('   First quiz._id:', quizzes[0]._id);
      console.log('   All quiz IDs:', quizzes.map((q, i) => ({ index: i, id: q._id, title: q.title })));
    }
  }, [quizzes]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log('📚 ===== fetchQuizzes STARTED =====');
      console.log('   Fetching with filters:', { status: 'published' });
      
      const response = await getAllQuizzes({ status: 'published' });
      console.log('✅ getAllQuizzes API returned:', response);
      
      if (response.success) {
        const quizData = response.data || [];
        console.log('📋 Quiz data received:');
        console.log('   - Count:', quizData.length);
        console.log('   - Type:', typeof quizData);
        console.log('   - Is array:', Array.isArray(quizData));
        
        if (quizData.length > 0) {
          console.log('   - First item:', quizData[0]);
          console.log('   - First item._id:', quizData[0]._id);
          console.log('   - All IDs:', quizData.map(q => q._id));
        }
        
        console.log('   Setting state with', quizData.length, 'quizzes');
        setQuizzes(quizData);
        console.log('   ✅ State updated');
      } else {
        throw new Error(response.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('❌ Error fetching quizzes:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load quizzes. Please try again.';
      toast.error(errorMsg);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    console.log('🎯 ===== handleStartQuiz CALLED =====');
    console.log('   Received quizId:', quizId);
    console.log('   Type:', typeof quizId);
    console.log('   Exists:', !!quizId);
    
    // Validate quiz ID
    if (!quizId) {
      console.error('❌ ERROR: Quiz ID is undefined or null in handleStartQuiz!');
      toast.error('Invalid quiz ID. Please refresh the page and try again.');
      return;
    }
    
    // Convert to string if it's an object
    const quizIdString = typeof quizId === 'object' ? String(quizId) : quizId;
    
    console.log('   Converted to string:', quizIdString);
    
    const targetUrl = `/quiz/${quizIdString}`;
    console.log('   Target URL:', targetUrl);
    console.log('   ✅ About to navigate to:', targetUrl);
    
    // Navigate to quiz attempt page
    toast.loading('Loading quiz...');
    navigate(targetUrl);
    
    console.log('   ✅ Navigate function called with:', targetUrl);
    setTimeout(() => {
      console.log('   📍 After navigate - current URL:', window.location.href);
    }, 100);
  };

  const getQuizStatusMessage = (quiz) => {
    const now = new Date();
    
    // Check access window
    if (quiz.accessWindow?.startDate && new Date(quiz.accessWindow.startDate) > now) {
      return {
        canStart: false,
        message: `Available from ${new Date(quiz.accessWindow.startDate).toLocaleDateString()}`
      };
    }
    
    if (quiz.accessWindow?.endDate && new Date(quiz.accessWindow.endDate) < now) {
      return {
        canStart: false,
        message: 'Access window expired'
      };
    }
    
    // Check scheduled time
    if (quiz.startTime && new Date(quiz.startTime) > now) {
      return {
        canStart: false,
        message: `Starts at ${new Date(quiz.startTime).toLocaleString()}`
      };
    }
    
    if (quiz.endTime && new Date(quiz.endTime) < now) {
      return {
        canStart: false,
        message: 'Quiz has ended'
      };
    }
    
    return { canStart: true, message: null };
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
            <AnimatedLoader message="Loading available quizzes" size="large" />
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
              {quizzes.map((quiz, index) => {
                // Skip quizzes without valid _id
                if (!quiz._id) {
                  console.error('❌ Quiz without _id found:', quiz);
                  return null;
                }
                
                // Log each quiz being rendered
                console.log(`📋 Rendering quiz ${index + 1}:`, {
                  id: quiz._id,
                  idType: typeof quiz._id,
                  title: quiz.title,
                  idString: String(quiz._id)
                });
                
                return (
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

                    {(() => {
                      const status = getQuizStatusMessage(quiz);
                      
                      if (!status.canStart) {
                        return (
                          <>
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-xs text-yellow-700 font-medium text-center">
                                ⏳ {status.message}
                              </p>
                            </div>
                            <button
                              disabled
                              className="mt-auto w-full py-3 px-4 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                              <Play size={18} />
                              Not Available Yet
                            </button>
                          </>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => {
                            console.log('🎯 ===== START QUIZ BUTTON CLICKED =====');
                            console.log('   Full quiz object:', quiz);
                            console.log('   Quiz._id:', quiz._id);
                            console.log('   Quiz._id exists?:', !!quiz._id);
                            console.log('   Quiz._id type:', typeof quiz._id);
                            console.log('   Quiz._id value:', String(quiz._id));
                            
                            // Extreme safety check
                            const finalId = quiz?._id;
                            console.log('   Final ID to pass:', finalId);
                            console.log('   Final ID exists?:', !!finalId);
                            
                            if (!finalId) {
                              console.error('❌ STOP: quiz._id is missing or falsy!');
                              toast.error('Quiz ID is missing. Cannot start quiz.');
                              return;
                            }
                            
                            console.log('   ✅ ID exists, calling handleStartQuiz');
                            handleStartQuiz(finalId);
                            console.log('   ✅ handleStartQuiz called');
                          }}
                          className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Play size={18} />
                          Start Quiz
                        </button>
                      );
                    })()}
                  </div>
                </motion.div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AvailableQuizzes;
