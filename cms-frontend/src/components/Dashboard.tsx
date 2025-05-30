import { GiCow } from 'react-icons/gi';
import { IoBatteryHalf } from 'react-icons/io5';
import { AiFillSafetyCertificate } from 'react-icons/ai';
import { MdDangerous } from 'react-icons/md';
import Map from './Map';

const Dashboard = () => {
  return (
    <>
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
        <div className="h-full flex w-5xl">
          <Map />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
