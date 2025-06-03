import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5010');

interface Notification {
  deviceId: number;
  heartRate: number;
  temperature: number;
  gpsLocation?: {
    latitude: number;
    longitude: number;
  };
  status: string;
  timestamp: string;
}

const NotificationDropDown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socket.on('new_notification', (data: Notification) => {
      console.log('New notification:', data);
      setNotifications((prev) => [data, ...prev]); // add newest on top
    });

    return () => {
      socket.off('new_notification');
    };
  }, []);

  return (
    <div className="absolute z-30 p-3 rounded-lg right-0 mt-2 w-64 bg-gray-50 border border-gray-300 shadow-lg">
      <h3 className="font-semibold text-gray-700">Notifications</h3>
      <ul className="mt-2 max-h-60 overflow-y-auto">
        {notifications.length === 0 && (
          <li className="text-sm text-gray-500">No notifications</li>
        )}
        {notifications.map((notification, idx) => (
          <li
            key={idx}
            className="p-1 hover:bg-gray-200 rounded text-sm text-gray-700">
            Cow {notification.deviceId} is <b>{notification.status}</b> <br />
            <span className="text-xs text-gray-500">
              {notification.timestamp}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropDown;
