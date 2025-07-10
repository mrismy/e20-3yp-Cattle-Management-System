import React, { useContext, useEffect, useRef } from "react";
import GlobalContext from "../context/GlobalContext";
import { useNotifications } from "../context/NotificationContext";
import { useParams } from "react-router-dom";

const AlertScreen = () => {
  const { notifications } = useNotifications();
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
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Cattle ID</th>
              <th className="px-4 py-2 border-b">Message</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Read</th>
              <th className="px-4 py-2 border-b">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No notifications
                </td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr
                  key={n._id}
                  ref={(el) => (rowRefs.current[n._id] = el)}
                  className={
                    id === n._id
                      ? "bg-green-200 "
                      : n.read
                      ? "bg-white"
                      : "bg-gray-100"
                  }
                >
                  <td className="px-4 py-2 border-b text-center">
                    {n.cattleId}
                  </td>
                  <td className="px-4 py-2 border-b">{n.message}</td>
                  <td className="px-4 py-2 border-b text-center">
                    <span
                      className={
                        n.status === "unsafe"
                          ? "text-red-500"
                          : "text-yellow-600"
                      }
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    {n.read ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    {new Date(n.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertScreen;
