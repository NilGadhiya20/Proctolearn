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
    const response = await apiClient.get('/quizzes', { params: filters });
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
