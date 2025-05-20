import { useState } from 'react';
import GeoFenceMap from './GeoFenceMap';
import { toast } from 'react-toastify';
import Axios, { axiosPrivate } from '../services/Axios';
import axios from 'axios';

const GeoFense = () => {
  const [newLocation, setNewLocation] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: Number;
    lng: Number;
  } | null>(null);
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };
  const [radius, setRadius] = useState(100);
  // Handle the change in the value of radius
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setRadius(value);
  };

  const handleSave = async () => {
    // if (!selectedLocation) {
    //   toast.warn('Please select a location before saving.');
    // }
    const locationData = {
      latitude: selectedLocation?.lat,
      longitude: selectedLocation?.lng,
      radius: radius,
    };
    console.log(locationData);
    const response = Axios.post('/geo-fence/new', locationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = (await response).data;
    console.log(data);
  };

  return (
    <div className="flex space-x-4">
      <div className="w-1/6">
        <div className="bg-white h-fit border-gray-400 rounded-lg p-3 mb-3">
          <h1 className="font-medium text-xl mb-2">Detected Location</h1>
          <p className="mb-1 text-md">
            Lat: {selectedLocation?.lat?.toFixed(8)}
          </p>
          <p className="text-md mb-2">
            Lng: {selectedLocation?.lng?.toFixed(8)}
          </p>
        </div>

        <div className="bg-white h-fit border-gray-400 rounded-lg p-3 mb-3">
          <h1 className="font-medium text-xl mb-2">Select Geo-fence Radius</h1>
          <div className="flex flex-col space-y-2">
            <input
              type="range"
              min={50}
              max={1000}
              step={50}
              value={radius}
              onChange={handleChange}
              disabled={!selectedLocation}
              className="w-full"
            />

            {/* TODO: Show error message for impropper input */}
            <input
              type="number"
              min={50}
              max={1000}
              step={50}
              value={radius}
              onChange={handleChange}
              disabled={!selectedLocation}
              className="w-full border rounded-md px-2 py-1 text-sm"
            />

            <p className="text-gray-700 text-sm">
              Radius: <span className="font-medium">{radius} meters</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!selectedLocation}
          className="w-full p-2 bg-green-700 text-white text-md rounded-sm hover:scale-105">
          Save
        </button>
      </div>

      {/* Map */}
      <div className="h-[700px] border-gray-400 w-5/6">
        <GeoFenceMap
          newLocation={newLocation}
          onLocationSelect={handleLocationSelect}
          radius={radius}
        />
      </div>
    </div>
  );
};

export default GeoFense;
