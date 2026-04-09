import apiClient from './api.js';

// Create Quiz
export const createQuiz = async (quizData) => {
  try {
    const response = await apiClient.post('/quizzes', quizData);
    return response.data;
  } catch (error) {
    console.error('Create quiz error:', error);
    throw error;
  }
};

// Get All Quizzes
export const getAllQuizzes = async (filters = {}) => {
  try {
    console.log('📡 getAllQuizzes API call with filters:', filters);
    const response = await apiClient.get('/quizzes', { params: filters });
    console.log('📡 getAllQuizzes raw response:', response);
    console.log('📡 getAllQuizzes response.data:', response.data);
    console.log('📡 getAllQuizzes response.data.data:', response.data.data);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📡 First quiz in response:', response.data.data[0]);
      console.log('📡 First quiz _id:', response.data.data[0]._id);
      console.log('📡 First quiz _id type:', typeof response.data.data[0]._id);
      console.log('📡 First quiz keys:', Object.keys(response.data.data[0]));
    }
    
    // Ensure _id is present for navigation
    if (response.data.data && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map(quiz => {
        if (!quiz._id && quiz.id) {
          console.warn('⚠️ Quiz missing _id but has id:', quiz.id);
          return { ...quiz, _id: quiz.id };
        }
        if (!quiz._id) {
          console.error('❌ CRITICAL: Quiz has no _id or id field!', quiz);
        }
        return quiz;
      });
    }
    
    console.log('📡 getAllQuizzes final response.data.data:', response.data.data);
    return response.data;
  } catch (error) {
    console.error('Get quizzes error:', error);
    throw error;
  }
};

// Get Quiz by ID
export const getQuizById = async (quizId) => {
  try {
    const response = await apiClient.get(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Get quiz error:', error);
    throw error;
  }
};

// Update Quiz
export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await apiClient.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  } catch (error) {
    console.error('Update quiz error:', error);
    throw error;
  }
};

// Delete Quiz
export const deleteQuiz = async (quizId) => {
  try {
    const response = await apiClient.delete(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Delete quiz error:', error);
    throw error;
  }
};

// Publish Quiz
export const publishQuiz = async (quizId) => {
  try {
    const response = await apiClient.post(`/quizzes/${quizId}/publish`);
    return response.data;
  } catch (error) {
    console.error('Publish quiz error:', error);
    throw error;
  }
};

// Toggle Quiz Status (Activate/Deactivate/etc)
export const toggleQuizStatus = async (quizId, status) => {
  try {
    const response = await apiClient.patch(`/quizzes/${quizId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Toggle quiz status error:', error);
    throw error;
  }
};

// Assign Students to Quiz
export const assignStudentsToQuiz = async (quizId, studentIds) => {
  try {
    const response = await apiClient.post(`/quizzes/${quizId}/assign-students`, {
      studentIds
    });
    return response.data;
  } catch (error) {
    console.error('Assign students error:', error);
    throw error;
  }
};

// Add Questions to Quiz
export const addQuestionsToQuiz = async (quizId, questions) => {
  try {
    const response = await apiClient.post(`/quizzes/${quizId}/questions`, { questions });
    return response.data;
  } catch (error) {
    console.error('Add questions error:', error);
    throw error;
  }
};

// Get quiz submissions (Faculty/Admin)
export const getQuizSubmissions = async (quizId) => {
  try {
    const response = await apiClient.get(`/quizzes/${quizId}/submissions`);
    return response.data;
  } catch (error) {
    console.error('Get quiz submissions error:', error);
    throw error;
  }
};

// Get detailed submission for faculty review/edit
export const getSubmissionDetails = async (submissionId) => {
  try {
    const response = await apiClient.get(`/quizzes/submission/${submissionId}/details`);
    return response.data;
  } catch (error) {
    console.error('Get submission details error:', error);
    throw error;
  }
};

// Update a reviewed submission with edited answers/marks
export const updateSubmissionGrade = async (submissionId, payload) => {
  try {
    const response = await apiClient.patch(`/quizzes/submission/${submissionId}/grade`, payload);
    return response.data;
  } catch (error) {
    console.error('Update submission grade error:', error);
    throw error;
  }
};

// Get activity logs for one submission (Faculty/Admin)
export const getSubmissionActivityLogs = async (submissionId) => {
  try {
    const response = await apiClient.get(`/quizzes/submission/${submissionId}/logs`);
    return response.data;
  } catch (error) {
    console.error('Get submission activity logs error:', error);
    throw error;
  }
};
