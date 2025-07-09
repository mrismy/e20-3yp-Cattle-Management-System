import { useEffect, useState } from 'react';
import { CattleData, SensorThreshold } from '../Interface';
import { GiCow } from 'react-icons/gi';
import { TbHeartRateMonitor } from 'react-icons/tb';
import { FaTemperatureFull } from 'react-icons/fa6';
import { FaLocationDot } from 'react-icons/fa6';
import dayjs from 'dayjs';
import HeartRateGraph from './HeartRateGraph';
import TemperatureGraph from './TemperatureGraph';
import { useParams } from 'react-router-dom';
import { axiosPrivate } from '../../services/Axios';

const CattleCard = () => {
  const { cattleId } = useParams<{ cattleId: string }>();
  const [cattleData, setCattleData] = useState<CattleData | null>(null);
  const [currentMenu, setCurrentMenu] = useState('overview');
  const [statusGraph, setStatusGraph] = useState('heartRate');
  const [loading, setLoading] = useState(true);
  const [sensorThreshold, setSensorThreshold] = useState<SensorThreshold>();

  const fetchSensorData = async () => {
    try {
      const response = await axiosPrivate.get(`/api/sensor/latest/${cattleId}`);
      setCattleData(response.data);
      console.log('Sensor data fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensorControl = async () => {
    try {
      const response = await axiosPrivate.get('/api/threshold');
      setSensorThreshold(response.data);
      console.log('Sensor threshold fetched successfully: ', response.data);
    } catch (error) {
      console.error('Error fetching sensor threshold data:', error);
    }
  };

  useEffect(() => {
    fetchSensorControl();
  }, []);

  useEffect(() => {
    fetchSensorData();
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
        <div className="text-gray-600 text-lg animate-pulse">
          Loading cattle data...
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-50">
      <div className="mt-10 overflow-x-auto px-5">
        <div className="flex items-start justify-between">
          {/* Navigation to display the livestocks with different status */}
          <nav>
            <ul className="flex items-center justify-start">
              {['overview', 'alerts'].map((menu) => (
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

        {/* Cattle Information Section */}
        <hr className="border-gray-300 w-full mb-8" />
        <div className="flex flex-col md:flex-row justify-between space-x-4 space-y-6">
          {/* Cattle Info Card */}
          <div className="flex w-full h-24 bg-white rounded-lg shadow-sm p-3 border border-gray-100 items-center justify-center">
            <div className="flex items-center justify-center space-x-8">
              <GiCow className="p-3 w-14 h-14 text-blue-600 bg-blue-100 border border-blue-200 rounded-full" />
              <div className="space-y-0.5 text-sm">
                <h3 className="font-medium text-gray-800">Basic Information</h3>
                <p>
                  <span className="text-gray-500 text-xs">Cattle ID:</span>{' '}
                  {cattleId || '--'}
                </p>
                <p>
                  <span className="text-gray-500 text-xs">Device ID:</span>{' '}
                  {cattleData?.deviceId || '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Heart rate Info Card */}
          <div className="flex w-full h-24 bg-white rounded-lg shadow-sm p-3 border border-gray-100 items-center justify-center">
            <div className="flex items-center justify-center space-x-8">
              <TbHeartRateMonitor className="p-3 w-14 h-14 text-red-600 bg-red-100 border border-red-200 rounded-full" />
              <div className="space-y-0 text-sm">
                <h3 className="font-medium text-gray-600 text-md">
                  Heart rate
                </h3>
                {/* TODO: Get the threshold form the backend */}
                <p
                  className={`${
                    (cattleData?.heartRate || 0) >
                      (sensorThreshold?.heartRate.max || 200) ||
                    (cattleData?.heartRate || 0) <
                      (sensorThreshold?.heartRate.min || 55)
                      ? 'text-red-700'
                      : 'text-green-700'
                  } text-lg font-semibold`}>
                  {cattleData?.heartRate + ' bpm' || '--'}
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {dayjs(cattleData?.updatedAt).format('h:mm A')}
                </p>
              </div>
            </div>
          </div>

          {/* Temperature Info Card */}
          <div className="flex w-full h-24 bg-white rounded-lg shadow-sm p-3 border border-gray-100 items-center justify-center">
            <div className="flex items-center justify-center space-x-8">
              <FaTemperatureFull className="p-3 w-14 h-14 text-orange-600 bg-orange-100 border border-orange-200 rounded-full" />
              <div className="space-y-0 text-sm">
                <h3 className="font-medium text-gray-600 text-md">
                  Temperature
                </h3>
                <p
                  className={`${
                    (cattleData?.temperature || 0) >
                      (sensorThreshold?.temperature.max || 40) ||
                    (cattleData?.temperature || 0) <
                      (sensorThreshold?.temperature.min || 35)
                      ? 'text-red-700'
                      : 'text-green-700'
                  } text-lg font-semibold`}>
                  {cattleData?.temperature + ' °C' || '--'}
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {dayjs(cattleData?.updatedAt).format('h:mm A')}
                </p>
              </div>
            </div>
          </div>

          {/* Location Info Card */}
          <div className="flex w-full h-24 bg-white rounded-lg shadow-sm p-3 border border-gray-100 items-center justify-center">
            <div className="flex items-center justify-center space-x-8">
              <FaLocationDot className="p-3 w-14 h-14 text-purple-600 bg-purple-100 border border-purple-200 rounded-full" />
              <div className="space-y-0 text-sm">
                <h3 className="font-medium text-gray-600 text-md">Location</h3>
                <p
                  className={`${
                    cattleData?.status === 'safe'
                      ? 'text-green-700'
                      : cattleData?.status === 'warning'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  } text-lg font-semibold`}>
                  {cattleData?.status || '--'}
                </p>
                <p className="text-xs text-gray-500">
                  Last updated: {dayjs(cattleData?.updatedAt).format('h:mm A')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 mb-4 flex items-center justify-center space-x-1">
          <button
            onClick={() => setStatusGraph('heartRate')}
            className={`py-1 px-2 w-38 border border-yellow-700 text-sm font-medium hover:bg-yellow-700 hover:text-white rounded-l-full hover:shadow-md ${
              statusGraph === 'heartRate' ? 'bg-yellow-700 text-white' : ''
            }`}>
            Heart rate graph
          </button>
          <button
            onClick={() => setStatusGraph('temperature')}
            className={`py-1 px-2 w-38 border border-yellow-700 text-sm font-medium hover:bg-yellow-700 hover:text-white rounded-r-full hover:shadow-md ${
              statusGraph === 'temperature' ? 'bg-yellow-700 text-white' : ''
            }`}>
            Temperature graph
          </button>
        </div>
        <div className="mb-4">
          {statusGraph === 'heartRate' ? (
            <HeartRateGraph cattleId={Number(cattleId)} />
          ) : (
            <TemperatureGraph cattleId={Number(cattleId)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CattleCard;
