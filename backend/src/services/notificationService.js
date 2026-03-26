import Notification from '../models/Notification.js';
import { getIOInstance } from '../utils/socketRegistry.js';

const serializeForClient = (notification, userId) => {
  const readEntry = (notification.readBy || []).find(
    (entry) => String(entry.user) === String(userId)
  );

  return {
    id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    severity: notification.severity,
    createdAt: notification.createdAt,
    read: Boolean(readEntry),
    context: notification.context || {}
  };
};

export const createAndDispatchNotification = async (payload) => {
  const {
    title,
    message,
    type = 'system',
    severity = 'info',
    audience = {},
    context = {}
  } = payload;

  const notification = await Notification.create({
    title,
    message,
    type,
    severity,
    audience,
    context
  });

  const io = getIOInstance();
  if (io) {
    const institutionKey = audience.institution?.toString() || 'global';

    // Emit to targeted users
    (audience.users || []).forEach((userId) => {
      io.to(`user-${userId}`).emit('notification', serializeForClient(notification, userId));
    });

    // Emit to role/institution rooms (e.g., faculty/admin)
    (audience.roles || []).forEach((role) => {
      io.to(`role-${role}-${institutionKey}`).emit('notification', serializeForClient(notification));
    });
  }

  return notification;
};

export const fetchNotificationsForUser = async ({ user, limit = 50 }) => {
  const query = {
    $or: [
      { 'audience.users': user._id },
      {
        'audience.roles': user.role,
        $or: [
          { 'audience.institution': null },
          { 'audience.institution': user.institution }
        ]
      }
    ]
  };

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  return notifications.map((n) => serializeForClient(n, user._id));
};

export const markNotificationRead = async ({ notificationId, user }) => {
  await Notification.updateOne(
    {
      _id: notificationId,
      'readBy.user': { $ne: user._id },
      $or: [
        { 'audience.users': user._id },
        {
          'audience.roles': user.role,
          $or: [
            { 'audience.institution': null },
            { 'audience.institution': user.institution }
          ]
        }
      ]
    },
    { $push: { readBy: { user: user._id, readAt: new Date() } } }
  );
};

export const markAllNotificationsRead = async ({ user }) => {
  const query = {
    $or: [
      { 'audience.users': user._id },
      {
        'audience.roles': user.role,
        $or: [
          { 'audience.institution': null },
          { 'audience.institution': user.institution }
        ]
      }
    ],
    'readBy.user': { $ne: user._id }
  };

  await Notification.updateMany(query, {
    $push: { readBy: { user: user._id, readAt: new Date() } }
  });
};

export default {
  createAndDispatchNotification,
  fetchNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead
};