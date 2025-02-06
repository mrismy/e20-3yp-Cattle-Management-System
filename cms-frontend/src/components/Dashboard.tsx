import cow_icon from '../assets/symbols/cow_icon.jpg';
import safe_icon from '../assets/symbols/safe.png';
import unsafe_icon from '../assets/symbols/unsafe.png';
import active_icon from '../assets/symbols/battery.jpg';

import Nav from './Nav';

const Dashboard = () => {
  return (
    <div className="flex w-full h-screen">
      <Nav />
      <div className="flex flex-col w-5/6 bg-gray-100">
        <div className="flex h-1/8 bg-white shadow-xl items-center">
          <h1 className="ml-7 font-stretch-expanded font-semibold text-2xl">
            Dashboard
          </h1>
        </div>
        <div className="h-7/8 mt-10">
          <div className="flex h-4/5 justify-evenly ">
            {/* Cattle details summary card */}
            <div className="grid grid-row-4 gap-5 w-64">
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">400</h1>
                  <p className="text-gray-600">Total Collors</p>
                </div>
                <div className="flex-row-reverse">
                  <img src={cow_icon} className="w-20 h-20" />
                </div>
              </div>
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">400</h1>
                  <p className="text-gray-600">Active Collors</p>
                </div>
                <div className="flex-row-reverse">
                  <img src={active_icon} className="w-20 h-20" />
                </div>
              </div>
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">320</h1>
                  <p className="text-gray-600">Safe Livestocks</p>
                </div>
                <div className="flex-row-reverse">
                  <img src={safe_icon} className="w-20 h-20" />
                </div>
              </div>
              <div className="flex bg-white p-5 rounded-3xl border-gray-400 shadow-l items-center justify-between">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold">80</h1>
                  <p className="text-gray-600">Unsafe Livestocks</p>
                </div>
                <div className="flex-row-reverse">
                  <img src={unsafe_icon} className="w-17 h-17" />
                </div>
              </div>
            </div>
            {/* Map */}
            <div className="felx bg-green-500 rounded-3xl w-5xl">Map</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
