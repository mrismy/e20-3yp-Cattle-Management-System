import React from "react";
import { useNotifications } from "../context/NotificationContext";

const NotificationDropDown = ({
  onNotificationClick,
}: {
  onNotificationClick?: (n: any) => void;
}) => {
  const { notifications, markRead, deleteNotification, clearAll, markAllRead } =
    useNotifications();

  return (
    <div className="fixed right-10 top-20 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <span className="font-bold">Notifications</span>
        <div className="flex gap-2">
          <button className="text-xs text-blue-600" onClick={markAllRead}>
            Mark all read
          </button>
          <button className="text-xs text-red-600" onClick={clearAll}>
            Clear all
          </button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="p-4 text-gray-500">No notifications</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className={`px-4 py-2 border-b cursor-pointer ${
              n.read ? "bg-white" : "bg-gray-200"
            }`}
            onClick={() => {
              markRead(n._id);
              if (onNotificationClick) onNotificationClick(n);
            }}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">Cattle {n.cattleId}</span>
              <span
                className={`text-xs ml-2 ${
                  n.status === "unsafe" ? "text-red-500" : "text-yellow-600"
                }`}
              >
                {n.status}
              </span>
            </div>
            <div className="text-sm">{n.message}</div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">
                {new Date(n.timestamp).toLocaleDateString()}{" "}
                {new Date(n.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                className="text-xs text-red-500 hover:underline ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationDropDown;
