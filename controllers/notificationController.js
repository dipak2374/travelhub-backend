import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
};
