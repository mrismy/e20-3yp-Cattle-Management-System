import { useState } from "react";
import { useLocation } from "react-router-dom";
import NotificationIcon from "./NotificationIcon";
import NotificationDropDown from "./NotificationDropDown";
import { FaCircleUser } from "react-icons/fa6";

const TopNav = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // Function to get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname.split("/")[1]; // Get the first part of the path
    if (!path) return "Dashboard";

    // Convert path to title case and handle special cases
    const title = path.charAt(0).toUpperCase() + path.slice(1);
    return title;
  };

  return (
    <div className="flex flex-row h-1/10 bg-green-50 shadow-xl justify-between items-center z-10">
      <h1 className="ml-7 font-stretch-110% font-bold text-2xl text-green-800">
        {getPageTitle()}
      </h1>
      <div className="flex justify-center items-center gap-9 mr-10">
        <div
          className="relative p-2 rounded-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <NotificationIcon count={120} />
          {isHovered && <NotificationDropDown />}
        </div>
        <FaCircleUser className="h-8 w-8 text-gray-800 hover:text-red-500" />
      </div>
    </div>
  );
};

export default TopNav;
