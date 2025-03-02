import { useContext, useEffect, useState } from 'react';
import { RiAddCircleLine } from 'react-icons/ri';
import { getAllCattle } from '../services/CattleListService';
import GlobalContext from '../context/GlobalContext';
import AddCattleForm from './AddCattleForm';
import { CattleData } from './Interface';
import dayjs from 'dayjs';
import { MdDeleteOutline } from 'react-icons/md';
import { MdOutlineEdit } from 'react-icons/md';

const CattleList = () => {
  const { showCattleAddForm, setShowCattleAddForm } = useContext(GlobalContext);
  const [cattleStatus, setCattleStatus] = useState('all livestocks');
  const [allCattleData, setAllCattleData] = useState<CattleData[]>([]);

  const addCattleForm = () => {
    setShowCattleAddForm(true);
    console.log(showCattleAddForm);
  };

  // Fetch all cattle data
  const fetchAllCattle = async () => {
    try {
      const response = await getAllCattle();
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
    <div className="mt-12 overflow-x-auto px-5">
      <div className="flex items-start justify-between mb">
        {/* Navigation to display the livestocks with different status */}
        <nav>
          <ul className="flex items-center justify-start">
            {['all livestocks', 'safe', 'unsafe'].map((status) => (
              <li
                key={status}
                className={`p-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:border-b-green-700 border-2 border-transparent cursor-pointer
                    ${
                      cattleStatus === status
                        ? 'text-green-700 border-b-green-700'
                        : 'text-gray-600'
                    }`}
                onClick={() => setCattleStatus(status)}>
                {status.toUpperCase()}
              </li>
            ))}
          </ul>
        </nav>

        {/* Add livestock button */}
        <button
          className="flex items-center justify-center space-x-2 bg-green-700 py-2 px-4 rounded-md text-white text-sm font-medium hover:bg-white hover:text-green-800 hover:border-1 border-green-600"
          onClick={addCattleForm}>
          <div className="text-lg">
            <RiAddCircleLine />
          </div>
          <div>Add Livestock</div>
        </button>
      </div>
      <hr className="text-gray-300 w-full mb-8" />

      {/* Table to display the livestock details */}
      <table className="w-full">
        <thead className="bg-green-700">
          <tr>
            {[
              'cattle id',
              'livestock name',
              'added on',
              'current state',
              'last update',
              'action',
            ].map((heading) => (
              <th
                key={heading}
                className="text-white px-5 py-3 text-sm font-bold uppercase">
                {heading.toLocaleUpperCase()}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white">
          {allCattleData.map((cattleData: CattleData) => (
            <tr
              key={cattleData.cattleId}
              className="bg-green-50 hover:bg-green-100 items-center justify-center">
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                {cattleData.cattleId}
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                {cattleData.cattleName}
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                {dayjs(cattleData.createdAt).format('DD/MM/YYYY HH:mm')}
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                <div
                  className={`${
                    cattleData.status === 'safe' ? 'bg-green-200' : 'bg-red-200'
                  } rounded-md`}>
                  {cattleData.status}
                </div>
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                {dayjs(cattleData.updatedAt).format('DD/MM/YYYY HH:mm')}
              </td>
              <td className="flex justify-center space-x-3 px-5 py-2 text-lg text-gray-700 text-center">
                <MdDeleteOutline />
                <MdOutlineEdit />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCattleAddForm && <AddCattleForm />}
    </div>
  );
};

export default CattleList;
