import Notification from '../model/notificationModel';
import { Request, Response } from 'express';

// Get all notifications
export const getNotifications = async (req: Request, res: Response) => {
  const notifications = await Notification.find({}).sort({ timestamp: -1 });
  // console.log(notifications);
  res.json(notifications);
};

// Get All unread notification
export const getUnReadNotifications = async (req: Request, res: Response) => {
  const notifications = await Notification.find({read: false}).sort({ timestamp: -1 });
  // console.log(notifications);
  res.json(notifications);
};

// Mark all notifications as read
export const markAllRead = async (req: Request, res: Response) => {
  await Notification.updateMany({ read: false }, { $set: { read: true } });
  res.json({ success: true });
};

// Clear all notifications
export const clearAll = async (req: Request, res: Response) => {
  await Notification.deleteMany({});
  res.json({ success: true });
};

// Mark single notification as read
export const markRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { $set: { read: true } });
  res.json({ success: true });
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Notification.findByIdAndDelete(id);
  res.json({ success: true });
}; 