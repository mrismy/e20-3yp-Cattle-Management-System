import Axios from '../../services/Axios';
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
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TemperatureProps {
  cattleId: number;
}

interface SensorData {
  hour: string;
  avgTemperature: number | null;
}

const TemperatureGraph = ({ cattleId }: TemperatureProps) => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCattleDataDay = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      const response = await Axios.get(
        `/api/sensor/withCattle/day/${formattedDate}/${cattleId}`
      );
      setSensorData(response.data);
    } catch (error) {
      console.error('Error fetching cattle data:', error);
      setError('Failed to load temperature data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCattleDataDay(selectedDate);
  }, [selectedDate, cattleId]);

  // Process temperature data
  const temperatureData = {
    labels: sensorData.map((item) => dayjs(item.hour).format('h:mm A')),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: sensorData.map((item) => item.avgTemperature),
        borderColor: '#e74c3c',
        backgroundColor: '#e74c3c',
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: 'Max Threshold',
        data: Array(sensorData.length).fill(40),
        borderColor: '#FFC3C3',
        borderDash: [5, 8],
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Min Threshold',
        data: Array(sensorData.length).fill(36),
        borderColor: '#FFC3C3',
        borderDash: [5, 8],
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptionsTemperature = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          stepSize: 1,
        },
      },
      y: {
        min: 30,
        max: 45,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Disable dates more than 7 days ago and future dates
  const isDateDisabled = (date: Date) => {
    return date > new Date() || date < dayjs().subtract(7, 'days').toDate();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="animate-pulse text-gray-500">
          Loading temperature data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm p-4 border border-gray-100 text-red-500">
        {error}
      </div>
    );
  }

  if (sensorData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-sm p-4 border border-gray-100 text-gray-500">
        No temperature data available for this date
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          Temperature Monitoring
        </h2>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => {
            if (date) setSelectedDate(date);
          }}
          dateFormat="dd MMMM yyyy"
          className="border border-gray-200 rounded-md px-3 py-1 text-sm hover:bg-gray-50 hover:shadow-sm"
          maxDate={new Date()}
          minDate={dayjs().subtract(7, 'days').toDate()}
          filterDate={(date) => !isDateDisabled(date)}
          placeholderText="Select date"
        />
      </div>

      <div className="h-80">
        <Line data={temperatureData} options={chartOptionsTemperature} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#e74c3c] rounded-full mr-2"></div>
          Current Temperature
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#2ecc71] rounded-full mr-2"></div>
          Normal Range (36-40°C)
        </div>
      </div>
    </div>
  );
};

export default TemperatureGraph;
