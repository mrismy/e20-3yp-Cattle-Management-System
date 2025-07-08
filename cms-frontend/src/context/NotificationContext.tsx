import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5010");

export interface Notification {
  _id: string;
  cattleId: number;
  message: string;
  status: string;
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  markAllRead: async () => {},
  clearAll: async () => {},
  markRead: async (_id: string) => {},
  deleteNotification: async (_id: string) => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch notifications on mount
    axios
      .get("http://localhost:5010/api/notifications")
      .then((res) => {
        console.log("Fetched notifications:", res.data);
        setNotifications(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
      });

    // Listen for new notifications
    socket.on("new_notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  const markAllRead = async () => {
    try {
      await axios.post("http://localhost:5010/api/notifications/markAllRead");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete("http://localhost:5010/api/notifications/clearAll");
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await axios.post(
        `http://localhost:5010/api/notifications/${id}/markRead`
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5010/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAllRead,
        clearAll,
        markRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
