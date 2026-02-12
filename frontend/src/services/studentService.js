import apiClient from './api';

export const getMyProfile = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data?.data;
};

export const updateMyProfile = async (payload) => {
  const res = await apiClient.patch('/auth/profile', payload);
  return res.data;
};

export const getMySubmissions = async () => {
  const res = await apiClient.get('/auth/me/submissions');
  return res.data?.data || [];
};

export default {
  getMyProfile,
  updateMyProfile,
  getMySubmissions,
};
