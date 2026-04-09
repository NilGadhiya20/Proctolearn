import apiClient from './api';

export const getQuizForAttempt = async (quizId) => {
  // Defensive validation - prevent undefined/invalid quizId from being used
  if (!quizId || quizId === 'undefined' || quizId === 'null') {
    const error = new Error('Invalid quiz ID provided');
    error.code = 'INVALID_QUIZ_ID';
    throw error;
  }
  
  const res = await apiClient.get(`/quizzes/${quizId}/attempt`);
  return res.data?.data;
};

export const saveAnswer = async (quizId, questionId, answer, flagged = false) => {
  // Defensive validation
  if (!quizId || quizId === 'undefined') {
    throw new Error('Invalid quiz ID provided');
  }
  if (!questionId) {
    throw new Error('Invalid question ID provided');
  }
  
  const res = await apiClient.post(`/quizzes/${quizId}/answer`, {
    questionId,
    answer,
    flagged
  });
  return res.data?.data;
};

export const submitQuiz = async (quizId, answers = null) => {
  // Defensive validation
  if (!quizId || quizId === 'undefined') {
    throw new Error('Invalid quiz ID provided');
  }
  
  const payload = Array.isArray(answers) ? { answers } : {};
  const res = await apiClient.post(`/quizzes/${quizId}/submit`, payload);
  return res.data?.data;
};

export const getSubmission = async (quizId) => {
  // Defensive validation
  if (!quizId || quizId === 'undefined') {
    throw new Error('Invalid quiz ID provided');
  }
  
  const res = await apiClient.get(`/quizzes/${quizId}/submission`);
  return res.data?.data;
};

export default {
  getQuizForAttempt,
  saveAnswer,
  submitQuiz,
  getSubmission,
};
