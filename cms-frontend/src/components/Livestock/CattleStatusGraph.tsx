import dayjs from 'dayjs';
import Axios from '../../services/Axios';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { IoCalendarNumber } from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CattleStatusGraphProps {
  cattleId: number;
}

interface SensorData {
  hour: string;
  avgHeartRate: number | null;
  avgTemperature: number | null;
  cattleId: number;
  cattleName: string;
}

const CattleStatusGraph = ({ cattleId }: CattleStatusGraphProps) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const hours = Array.from({ length: 24 }, (_, i) =>
    dayjs().startOf('day').add(i, 'hour').format('h A')
  );
  const heartRateMap = sensorData.reduce((acc, item) => {
    const hourLabel = dayjs(item.hour).format('h A');
    acc[hourLabel] = item.avgHeartRate;
    return acc;
  }, {} as Record<string, number | null>);
  const heartRateValues = hours.map((label) => heartRateMap[label] ?? null);

  const fetchCattleDataDay = async (date: string) => {
    try {
      console.log(cattleId);
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      const response = await Axios.get(
        `/api/sensor/withCattle/day/${formattedDate}/${cattleId}`
      );
      setSensorData(response.data);
      console.log('res', response.data);
    } catch (error) {
      console.error('Error fetching cattle data:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchCattleDataDay(selectedDate.toISOString());
    }
  }, [selectedDate]);

  if (sensorData.length === 0)
    return <div className="text-center py-4">No heart rate data available</div>;

  const heartRateData = {
    labels: sensorData.map((item) => dayjs(item.hour).format('h:mm A')),
    datasets: [
      {
        label: 'Heart rate',
        data: heartRateValues,
        borderColor: '#e74c3c',
        backgroundColor: '#e74c3c',
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: 'Max Threshold',
        data: Array(24).fill(80),
        borderColor: '#FFC3C3',
        borderDash: [5, 8],
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Min Threshold',
        data: Array(24).fill(55),
        borderColor: '#FFC3C3',
        borderDash: [5, 8],
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptionsHeartRate = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          stepSize: 1,
          asutoSkip: false,
        },
      },
      y: {
        min: 30,
        max: 90,
        ticks: {
          stepSize: 15,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          Heart Rate Monitoring
        </h2>
        <div className="text-sm text-gray-500">
          {/* <div className="flex items-center space-x-2"> */}
          {/* <IoCalendarNumber className="text-lg text-gray-700" /> */}
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat="dd MMMM yyyy"
            className="top-0 left-0 text-sm w-28 border border-gray-200 rounded-sm px-2 py-1 items-center hover:bg-gray-50 hover:shadow-sm"
            maxDate={new Date()}
          />
          {/* </div> */}
        </div>
      </div>

      <div className="h-80">
        <Line data={heartRateData} options={chartOptionsHeartRate} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#e74c3c] rounded-full mr-2"></div>
          Current Heart Rate
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#2ecc71] rounded-full mr-2"></div>
          Normal Range (55-80 bpm)
        </div>
      </div>
    </div>
  );
};

export default CattleStatusGraph;
