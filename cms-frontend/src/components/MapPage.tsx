import { useState } from 'react';
import LiveLocation from './LiveLocation';
import NavSub from './NavSub';

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
      {selectedOption === 'live location' && <LiveLocation />}
    </div>
  );
};

export default MapMenu;
