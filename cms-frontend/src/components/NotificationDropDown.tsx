import { useEffect } from 'react';

const NotificationDropDown = () => {
  const fetchAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      console.log('Response:', response);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  useEffect(() => {
    fetchAllNotifications();
  }, []);
  return (
    <div className="absolute z-30 p-3 rounded-lg right-0 mt-2 w-64 bg-gray-50 border border-gray-300 shadow-lg">
      <h3 className="font-semibold text-gray-700">Notifications</h3>
      <ul className="mt-2">
        <li className="p-1 hover:bg-gray-200 rounded">Notifications 1</li>
        <li className="p-1 hover:bg-gray-200 rounded">Notifications 2</li>
        <li className="p-1 hover:bg-gray-200 rounded">Notifications 3</li>
        <li className="p-1 hover:bg-gray-200 rounded">Notifications 4</li>
      </ul>
    </div>
  );
};

export default NotificationDropDown;
