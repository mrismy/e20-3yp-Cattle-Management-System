import { Notification } from './TopNav';

interface Props {
  notifications: Notification[];
}

const NotificationDropDown = ({ notifications }: Props) => {
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
            className="p-1 hover:bg-gray-200 rounded text-sm text-gray-700"
          >
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
