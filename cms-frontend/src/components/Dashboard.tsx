import { GiCow } from 'react-icons/gi';
import { IoBatteryHalf } from 'react-icons/io5';
import { AiFillSafetyCertificate } from 'react-icons/ai';
import { MdDangerous } from 'react-icons/md';
import { FaCircleUser } from 'react-icons/fa6';
import Nav from './Nav';
import NotificationIcon from './NotificationIcon';
import { useState } from 'react';
import NotificationDropDown from './NotificationDropDown';

const Dashboard = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="flex w-full h-screen">
      <div className="flex flex-col w-1/6 shadow-2xl z-10">
        <Nav />
      </div>
      <div className="flex flex-col w-5/6 bg-gray-100">
        <div className="flex flex-row h-1/10 bg-green-50 shadow-xl justify-between items-center">
          <h1 className="ml-7 font-stretch-110% font-bold text-2xl text-green-800">
            Dashboard
          </h1>
          <div className="flex justify-center items-center gap-9 mr-10">
            <div
              className="relative p-2 rounded-2xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}>
              <NotificationIcon count={120} />
              {isHovered && <NotificationDropDown />}
            </div>
            <FaCircleUser className="h-8 w-8 text-gray-800 hover:text-red-500" />
          </div>
        </div>
        <div className="h-9/10 relative">
          <div className="absolute top-0 left-0 w-full h-44 bg-green-700 z-0">
            <h1 className="py-7 px-12 text-white text-3xl font-stretch-110% font-bold">
              Welcome to CMS
            </h1>
          </div>
          <div className="relative z-10 flex h-4/5 justify-evenly mt-28">
            {/* Cattle details summary card */}
            <div className="grid grid-row-4 gap-5 w-64">
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between hover:bg-gray-300 hover:scale-103">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">400</h1>
                  <p className="text-gray-600">Total Collors</p>
                </div>
                <div className="flex-row-reverse">
                  <GiCow className="w-14 h-14 text-white p-2 bg-green-700 border-5 border-green-800 rounded-full" />
                </div>
              </div>
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between hover:bg-gray-300 hover:scale-103">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">400</h1>
                  <p className="text-gray-600">Active Collors</p>
                </div>
                <div className="flex-row-reverse">
                  <IoBatteryHalf className="w-14 h-14 text-white p-2 bg-green-700 border-5 border-green-800 rounded-full" />
                </div>
              </div>
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between hover:bg-gray-300 hover:scale-103">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">320</h1>
                  <p className="text-gray-600">Safe Livestocks</p>
                </div>
                <div className="flex-row-reverse">
                  <AiFillSafetyCertificate className="w-14 h-14 text-white p-2 bg-green-700 border-5 border-green-800 rounded-full" />
                </div>
              </div>
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between hover:bg-gray-300 hover:scale-103">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">80</h1>
                  <p className="text-gray-600">Unsafe Livestocks</p>
                </div>
                <div className="flex-row-reverse">
                  <MdDangerous className="w-14 h-14 text-white p-2 bg-red-700 border-5 border-red-800 rounded-full" />
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="felx bg-blue-200 rounded-2xl w-5xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
