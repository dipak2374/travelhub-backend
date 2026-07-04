import Notification from '../models/Notification.js';

export const createNotification = async (userId, { title, message, type = 'system', link, metadata }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
    metadata,
  });
  return notification;
};

export const emitNotification = (io, userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

export const notifyUser = async (io, userId, data) => {
  const notification = await createNotification(userId, data);
  emitNotification(io, userId, notification);
  return notification;
};
