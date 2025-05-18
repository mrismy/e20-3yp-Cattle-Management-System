import { useEffect, useState } from 'react';
import UseAxiosPrivate from '../hooks/UseAxiosPrivate';
import Map from './Map';
import { CattleData } from './Interface';

const LiveLocation = () => {
  const [allCattleData, setAllCattleData] = useState<CattleData[]>([]);
  const axiosPrivate = UseAxiosPrivate();
  const fetchAllCattle = async () => {
    try {
      const response = await axiosPrivate.get('/api/sensor/latestWithCattle');
      const data = response.data;
      console.log('Response:', data);
      setAllCattleData(data);
    } catch (error) {
      console.error('Error fetching cattle data:', error);
      setAllCattleData([]);
    }
  };
  useEffect(() => {
    fetchAllCattle();
  }, []);

  return (
    <div>
      <div className="h-[450px] border border-gray-400 w-full">
        <Map />
      </div>
      <div className="flex justify-evenly space-x-4 mt-4">
        {/* Table for safe cattle */}
        <div className="relative h-[250px] w-full overflow-hidden shadow-xl rounded-md">
          <table className="w-full">
            <thead className="bg-green-700 text-white sticky top-0">
              <tr>
                <th className="px-5 py-3 text-start font-bold uppercase">
                  Safe Cattle
                </th>
                <th className="px-5 py-3 text-end font-bold uppercase">
                  Location
                </th>
              </tr>
            </thead>
          </table>
          <div className="overflow-y-auto h-full">
            <table className="w-full border border-gray-200">
              <tbody className="bg-white">
                {allCattleData
                  .filter((cattle) => cattle.status === 'safe')
                  .map((cattle) => (
                    <tr
                      key={cattle.cattleId}
                      className="border-b border-gray-200">
                      <td className="text-gray-700 text-md font-medium text-start py-2 px-5">
                        Cow + {cattle.cattleId}
                      </td>
                      <td className="text-gray-700 text-sm text-end py-2 px-5">
                        {
                          (cattle.gpsLocation.latitude,
                          cattle.gpsLocation.longitude)
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Table for unsafe cattle */}
        <div className="relative h-[250px] w-full overflow-hidden shadow-xl rounded-md">
          <table className="w-full">
            <thead className="bg-red-700 text-white sticky top-0">
              <tr>
                <th className="px-5 py-3 text-start font-bold uppercase">
                  Unsafe Cattle
                </th>
                <th className="px-5 py-3 text-end font-bold uppercase">
                  Location
                </th>
              </tr>
            </thead>
          </table>
          <div className="overflow-y-auto h-full">
            <table className="w-full border border-gray-200">
              <tbody className="bg-white">
                {/* {allCattleData
                  .filter((cattle) => cattle.status === 'unsafe')
                  .map((cattle) => (
                    <tr
                      key={cattle.cattleId}
                      className="border-b border-gray-200">
                      <td className="text-gray-700 text-md font-medium text-start py-2 px-5">
                        Cow + {cattle.cattleId}
                      </td>
                      <td className="text-gray-700 text-sm text-end py-2 px-5">
                        {
                          (cattle.gpsLocation.latitude,
                          cattle.gpsLocation.longitude)
                        }
                      </td>
                    </tr>
                  ))} */}
                {[...Array(20)].map((_, i) => (
                  <tr key={i}>
                    <td className="text-gray-700 text-md text-start py-2 px-5">
                      Cow {i + 1}
                    </td>
                    <td className="text-gray-700 text-md text-end py-2 px-5">
                      (423, 42)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveLocation;
