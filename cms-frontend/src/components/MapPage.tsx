import { useState } from 'react';
import LiveLocation from './LiveLocation';
import NavSub from './NavSub';
import GeoFence from './GeoFence';

const MapMenu = () => {
  const mapOptions = ['live location', 'geo fence'];
  const [selectedOption, setSelectedOption] = useState('live location');

  return (
    <div className="mt-12 overflow-x-auto px-5">
      <div className="flex items-center justify-between mb">
        {/* Navigation to display the different map options */}
        <NavSub
          options={mapOptions}
          selectedOption={selectedOption}
          onSelect={setSelectedOption}
        />
      </div>
      <hr className="text-gray-300 w-full mb-8" />
      {selectedOption === 'live location' && <LiveLocation />}
      {selectedOption === 'geo fence' && <GeoFence />}
    </div>
  );
};

export default MapMenu;
