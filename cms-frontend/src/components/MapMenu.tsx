import { useState } from 'react';

const MapMenu = () => {
  const [mapOption, setMapOption] = useState('live location');

  return (
    <div className="mt-12 overflow-x-auto px-5">
      <div className="flex items-center justify-between mb">
        <nav>
          <ul className="flex items-center justify-start">
            {['live location', 'geo fence'].map((option) => (
              <li
                key={option}
                className={`p-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:border-b-green-700 border-2 border-transparent cursor-pointer
                ${
                  mapOption === option
                    ? 'text-green-700 border-b-green-700'
                    : 'text-gray-600'
                }`}
                onClick={() => setMapOption(option)}>
                {option.toLocaleUpperCase()}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MapMenu;
