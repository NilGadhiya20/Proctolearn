import apiClient from './api.js';

// Get current student's quiz submissions (My Quizzes)
export const getMyQuizzes = async () => {
  try {
    const response = await apiClient.get('/users/me/submissions');
    return response.data;
  } catch (error) {
    console.error('Get my quizzes error:', error);
    throw error;
  }
};
