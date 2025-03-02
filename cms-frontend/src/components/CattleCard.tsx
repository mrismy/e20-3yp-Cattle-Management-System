import { useState } from 'react';
import { FieldValue, useForm, FieldValues } from 'react-hook-form';
import { CattleData } from './Interface';
import dayjs from 'dayjs';

interface CattleCardProps {
  cattleData: CattleData | null;
}

const CattleCard = (cattleData: CattleCardProps) => {
  const [currentMenu, setCurrentMenu] = useState('overview');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="absolute inset-0 bg-gray-50">
      <div className="mt-12 overflow-x-auto px-5">
        <h2 className="text-lg text-gray-700 font-semibold">
          {cattleData.cattleData?.cattleName}
        </h2>
        <div className="flex items-start justify-between">
          {/* Navigation to display the livestocks with different status */}
          <nav>
            <ul className="flex items-center justify-start">
              {['overview', 'health', 'location', 'alerts'].map((menu) => (
                <li
                  key={menu}
                  className={`p-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:border-b-green-700 border-2 border-transparent cursor-pointer
                ${
                  menu === currentMenu
                    ? 'text-green-700 border-b-green-700'
                    : 'text-gray-600'
                }`}
                  onClick={() => setCurrentMenu(menu)}>
                  {menu.toUpperCase()}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Cattle information */}
        <hr className="text-gray-300 w-full mb-8" />
        <div className="flex flex-row items-center justify-between space-x-8 p-8">
          <div className="w-full h-96 bg-amber-200 p-5">
            <h1>Cattle Information</h1>
            <div>Cattle ID: {cattleData.cattleData?.cattleId}</div>
            <div> Cattle Name: {cattleData.cattleData?.cattleName}</div>
          </div>
          <div className="flex justify-between w-full h-96 bg-green-100 rounded-xl p-5 shadow-xl">
            <div>
              <h1>Cattle Status</h1>
              <p>
                {dayjs(cattleData.cattleData?.updatedAt).format(
                  'DD/MM/YYYY HH:mm'
                )}
              </p>
            </div>
            <div>{cattleData.cattleData?.status}</div>
            {cattleData.cattleData?.heartRate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CattleCard;
