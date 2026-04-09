import apiClient from './api.js';

export const fetchNotificationFeed = async() => {
    const response = await apiClient.get('/notifications/feed');
    return response.data?.data || [];
};

export const markNotificationRead = async(notificationId) => {
    if (!notificationId) return;
    await apiClient.patch(`/notifications/read/${notificationId}`);
};

export const markAllNotificationsRead = async() => {
    await apiClient.patch('/notifications/read-all');
};

export const clearAllNotifications = async() => {
    await apiClient.patch('/notifications/clear-all');
};

export default {
    fetchNotificationFeed,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications
};