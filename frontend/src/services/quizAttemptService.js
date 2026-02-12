import apiClient from './api';

export const getQuizForAttempt = async (quizId) => {
  const res = await apiClient.get(`/quizzes/${quizId}/attempt`);
  return res.data?.data;
};

export const saveAnswer = async (quizId, questionId, answer, flagged = false) => {
  const res = await apiClient.post(`/quizzes/${quizId}/answer`, {
    questionId,
    answer,
    flagged
  });
  return res.data?.data;
};

export const submitQuiz = async (quizId) => {
  const res = await apiClient.post(`/quizzes/${quizId}/submit`);
  return res.data?.data;
};

export const getSubmission = async (quizId) => {
  const res = await apiClient.get(`/quizzes/${quizId}/submission`);
  return res.data?.data;
};

export default {
  getQuizForAttempt,
  saveAnswer,
  submitQuiz,
  getSubmission,
};
