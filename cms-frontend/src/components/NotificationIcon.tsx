import { MdNotifications } from 'react-icons/md';

const NotificationIcon = ({ count }: { count: number }) => {
  return (
    <div className="relative">
      <MdNotifications className="w-9 h-9 text-gray-800 hover:text-red-500" />

      {/* Notification Badge */}
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
