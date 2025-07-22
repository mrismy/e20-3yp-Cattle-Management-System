import React, { useContext, useEffect, useRef } from "react";
import GlobalContext from "../context/GlobalContext";
import { useNotifications } from "../context/NotificationContext";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

const AlertScreen = () => {
  const { notifications, markRead } = useNotifications();
  const { setSelectedMenu } = useContext(GlobalContext);
  const { id } = useParams();
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  useEffect(() => {
    setSelectedMenu("Alerts");
  }, [setSelectedMenu]);

  useEffect(() => {
    if (id && rowRefs.current[id]) {
      rowRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [id, notifications]);

  return (
    <div className="mt-10 overflow-x-auto px-5">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
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
              console.log(
                "Notification status:",
                n.status,
                "Type:",
                typeof n.status
              );
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
                    id === n._id
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
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        n.status === "DANGER"
                          ? "bg-red-100 text-red-800"
                          : n.status === "WARNING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
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
