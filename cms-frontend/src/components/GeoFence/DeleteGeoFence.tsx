import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import Axios from '../../services/Axios';

interface geoFenceInterface {
  latitude: number;
  longitude: number;
  radius: number;
  zoneType: string;
  zoneName: string;
}

const DeleteGeoFence = () => {
  //   const [geoFences, setGeoFences] = useState<geoFenceInterface>();
  const mapRef = useRef<L.Map | null>(null);

  const fetchAllGeoFence = async () => {
    try {
      const response = await Axios.get('/geo-fence/');
      const geoFences = response.data;
      //   setGeoFences(geoFences);
      console.log(geoFences);
      geoFences.forEach((geoFence: geoFenceInterface) => {
        const { latitude, longitude, radius, zoneType } = geoFence;
        if (zoneType === 'safe') {
          const circle = L.circle([latitude, longitude], {
            radius,
            color: '#1F7D53',
            fillColor: '#DDF6D2',
            fillOpacity: 0.3,
          }).addTo(mapRef.current!);
          circle.bindPopup;
          // circle.bindPopup(`<b>${zoneName}</b><br>Radius: ${radius} m`);
        } else {
          const circle = L.circle([latitude, longitude], {
            radius,
            color: '#E83F25',
            fillColor: '#FFAAAA',
            fillOpacity: 0.3,
          }).addTo(mapRef.current!);
          circle.bindPopup('Cannot add Geo-fence inside danger zone');
        }
      });
    } catch (error) {
      console.log('Error in fetching data');
    }
  };

  useEffect(() => {
    const map = L.map('map').setView([6.872591, 80.797847], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      map
    );

    fetchAllGeoFence();

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="flex">
      <div className="w-2/5">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Zone Type</th>
              <th></th>
            </tr>
          </thead>
          <div>{/* <table>{geoFe}</table> */}</div>
        </table>
      </div>

      <div className="h-[700px] border border-gray-400 w-3/5">
        <div id="map" className="h-full w-full rounded-xl" />;
      </div>
    </div>
  );
};

export default DeleteGeoFence;
