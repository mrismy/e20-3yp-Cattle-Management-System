import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GeoFenceMapInterface {
  newLocation: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  radius: number;
}

const GeoFenceMap = ({
  newLocation,
  onLocationSelect,
  radius,
}: GeoFenceMapInterface) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    // Initialize the map
    const map = L.map('map').setView([6.872591, 80.797847], 16); // Default view (Coordinate, zoom)
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      map
    );

    // Handle map click
    newLocation &&
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });

        // Remove existing marker and circle if any
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        if (circleRef.current) {
          map.removeLayer(circleRef.current);
        }

        // Add marker at clicked position
        const marker = L.marker([lat, lng]).addTo(map);
        marker
          .bindPopup(
            `Selected Location<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(
              5
            )}`
          )
          .openPopup();
        markerRef.current = marker;

        // Add geofence
        const circle = L.circle([lat, lng], {
          radius: radius,
          color: 'blue',
          fillColor: '#87ceeb',
          fillOpacity: 0.4,
        }).addTo(map);
        circleRef.current = circle;

        onLocationSelect(lat, lng);
      });

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

  useEffect(() => {
    if (selectedLocation && circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  return <div id="map" className="h-full w-full rounded-2xl" />;
};

export default GeoFenceMap;
