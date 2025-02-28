import { useState } from 'react';
import { RiAddCircleLine } from 'react-icons/ri';

const CattleList = () => {
  const [cattleStatus, setCattleStatus] = useState('all livestocks');

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
        <button className="flex items-center justify-center space-x-2 bg-green-700 py-2 px-4 rounded-md text-white text-sm font-medium">
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
              'collor id',
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
        <tbody className="bg-green-50 divide-y divide-white">
          <tr className="items-center justify-center">
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              cow_10
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Cow10
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              collor_10
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Date
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              <div className="bg-green-200 rounded-md">safe</div>
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Date
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Action
            </td>
          </tr>
          {cattleStatus === 'unsafe' && (
            <tr>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                cow_10
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                Cow10
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                collor_10
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                Date
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                safe
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                Date
              </td>
              <td className="px-5 py-2 text-sm text-gray-700 text-center">
                Action
              </td>
            </tr>
          )}
          <tr>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              cow_10
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Cow10
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              collor_10
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Date
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              safe
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Date
            </td>
            <td className="px-5 py-2 text-sm text-gray-700 text-center">
              Action
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CattleList;
