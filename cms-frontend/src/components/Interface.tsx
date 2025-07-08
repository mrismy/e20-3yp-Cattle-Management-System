export interface CattleData {
  cattleId: string;
  deviceId: string | null;
  cattleName: string;
  createdAt: string;
  cattleStatus: string;
  updatedAt: string;
  heartRate: number;
  temperature: number;
  gpsLocation: {
    latitude: number;
    longitude: number;
  };
  status: string;
}

export interface SensorThreshold {
  heartRate: {
    min: number;
    max: number;
  };
  temperature: {
    min: number;
    max: number;
  };
  geoFence: {
    safeThreshold: number;
    dangerThreshold: number;
  };
}
