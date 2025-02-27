import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// interface CattleLocation {
//   gpsLocation: {
//     latitude: number;
//     longitude: number;
//   };
//   timestamp: string;
// }

const Map = () => {
  useEffect(() => {
    // Initialize the map
    const map = L.map('map').setView([6.872591, 80.797847], 16); // Default view (Coordinate, zoom)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      map
    );

    //   // Define dummy data with an index signature
    //   const dummyData: Record<string, CattleLocation> = {
    //     cow_001: {
    //       gpsLocation: { latitude: 6.9001, longitude: 80.8005 },
    //       timestamp: '2025-02-19 10:30:00',
    //     },
    //     cow_002: {
    //       gpsLocation: { latitude: 6.8742, longitude: 80.7934 },
    //       timestamp: '2025-02-19 11:15:00',
    //     },
    //   };

    //   setTimeout(() => {
    //     Object.keys(dummyData).forEach((key) => {
    //       const value = dummyData[key];
    //       const marker = L.marker([
    //         value.gpsLocation.latitude,
    //         value.gpsLocation.longitude,
    //       ]).addTo(map);

    //       marker.bindPopup(
    //         `<b>Cattle ID: ${key}</b><br>Location (${value.gpsLocation.latitude}, ${value.gpsLocation.longitude})<br> Timestamp: ${value.timestamp}`
    //       );
    //     });
    //   }, 1000);

    //   return () => {
    //     map.remove();
    //   };
    // }, []);

    // Fetch GPS data from backend
    fetch('http://localhost:5000/api/sensor/location')
      .then((response) => response.json())
      .then((data) => {
        Object.keys(data).forEach((key) => {
          const value = data[key];
          const marker = L.marker([
            value.gpsLocation.latitude,
            value.gpsLocation.longitude,
          ]).addTo(map);
          marker.bindPopup(
            `<b>Cattle ID: ${key}</b><br>Lat: ${value.gpsLocation.latitude}, Lon: ${value.gpsLocation.longitude}<br> Timestamp: ${value.timestamp}`
          );
        });
      })
      .catch((error) => console.error('Error fetching GPS data:', error));

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="h-full flex bg-blue-200 rounded-2xl w-5xl">
      <div id="map" className="h-full w-full rounded-2xl" />
    </div>
  );
};

export default Map;
