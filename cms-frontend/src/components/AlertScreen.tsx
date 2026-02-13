import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import UseAxiosPrivate from "../hooks/UseAxiosPrivate";
import { Notification } from "../context/NotificationContext";

const AlertScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const privateAxios = UseAxiosPrivate();
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  useEffect(() => {
    const getAllNotification = async () => {
      try {
        const resp = await privateAxios.get('/api/notifications');
        console.log(resp.data);
        setNotifications(resp.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    getAllNotification();
  }, []);

  useEffect(() => {
    if (selectedId && rowRefs.current[selectedId]) {
      rowRefs.current[selectedId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedId, notifications]);

  const markRead = async (id: string) => {
    try {
      await privateAxios.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setSelectedId(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DANGER': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-10 overflow-x-auto px-5">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
        {notifications.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {notifications.filter(n => !n.read).length} unread
          </span>
        )}
      </div>
      <hr className="text-gray-300 w-full mb-8" />

      {/* Table to display the alert notifications */}
      <table className="w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-md">
        <thead className="text-gray-800 bg-white">
          <tr>
            {["cattle id", "message", "status", "read status", "timestamp"].map(
              (heading) => (
                <th
                  key={heading}
                  className="py-4 text-center text-sm font-medium uppercase tracking-wider"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              return (
                <tr
                  key={n._id}
                  ref={(el) => (rowRefs.current[n._id] = el)}
                  onClick={() => {
                    if (!n.read) {
                      markRead(n._id);
                    }
                  }}
                  className={`cursor-pointer transition-colors ${
                    selectedId === n._id
                      ? "bg-green-50 hover:bg-green-100"
                      : n.read
                      ? "hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <td className="py-3 text-center text-sm font-medium text-gray-900">
                    {n.cattleId}
                  </td>

                  <td className="py-3 text-center text-sm text-gray-900 px-4">
                    <div className="max-w-xs truncate" title={n.message}>
                      {n.message}
                    </div>
                  </td>

                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(n.status)}`}
                    >
                      {n.status?.charAt(0).toUpperCase() + n.status?.slice(1).toLowerCase()}
                    </span>
                  </td>

                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        n.read
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {n.read ? "Read" : "Unread"}
                    </span>
                  </td>

                  <td className="py-3 text-center text-sm text-gray-500">
                    {dayjs(n.timestamp).format("MMM D, YYYY h:mm A")}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                No notifications available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AlertScreen;