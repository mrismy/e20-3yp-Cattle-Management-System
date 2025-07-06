import latestSensorData from '../model/sensorData';
import geoFenceController = require('../controller/geoFenceController');
import geoFenceModel from '../model/geoFenceModel';
import sensorData from '../model/sensorData';

export enum ZoneStatus {
  Safe = 'SAFE',
  Warning = 'WARNING',
  Danger = 'DANGER',
  Unknown = 'UNKNOWN',
}

export enum HeartRateStatus {
  Safe = 'SAFE',
  Danger = 'DANGER',
}

export enum TemperatureStatus {
  Safe = 'SAFE',
  Danger = 'DANGER',
}

interface CattleDataInterface {
  heartRate: number;
  temperature: number;
  deviceId: number;
}

export class CattleSensorData {
  private static boundaries = {
    heartRate: { min: 10, max: 200 },
    temperature: { min: 20, max: 40 },
    gpsGeofence: {
      minLatitude: 6.772591,
      maxLatitude: 6.972591,
      minLongitude: 80.697847,
      maxLongitude: 80.897847,
    },
  };

  public static saftyStatus = async (cattleId: number) => {
    const cattleHeartRateStatus = await this.isHeartRateSafe(cattleId);
    const cattleTemperatureStatus = await this.isTemperatureSafe(cattleId);
    // const ZoneStatus = this.isCattleInSafeZone();
    if (
      cattleHeartRateStatus === HeartRateStatus.Safe &&
      cattleTemperatureStatus === TemperatureStatus.Safe
    ) {
      return 'safe';
    }
    return 'unsafe';
  };

  // Check if the temperature is safe for a specific cattle
  public static isTemperatureSafe = async (
    cattleId: number
  ): Promise<TemperatureStatus> => {
    const latestData = await latestSensorData.findOne({ deviceId: cattleId });
    if (!latestData) {
      return TemperatureStatus.Danger;
    } else if (
      latestData.temperature >= this.boundaries.temperature.min &&
      latestData.temperature <= this.boundaries.temperature.max
    ) {
      return TemperatureStatus.Safe;
    }
    return TemperatureStatus.Danger;
  };

  // Check if the heart rate is safe for a specific cattle
  public static isHeartRateSafe = async (
    cattleId: number
  ): Promise<HeartRateStatus> => {
    const latestData = await latestSensorData.findOne({ deviceId: cattleId });
    if (!latestData) {
      return HeartRateStatus.Danger;
    } else if (
      latestData.heartRate >= this.boundaries.heartRate.min &&
      latestData.heartRate <= this.boundaries.heartRate.max
    ) {
      return HeartRateStatus.Safe;
    }
    return HeartRateStatus.Danger;
  };

  // Check in which zone(Safe, warning, unsafe) a specific cattle is in
  public static isCattleInSafeZone = async (
    cattleId: number
  ): Promise<ZoneStatus> => {
    const threshold = 4;
    const geoFences = await geoFenceModel.find();
    if (geoFences.length === 0) {
      return ZoneStatus.Safe;
    }

    const latestData = await latestSensorData.findOne({ deviceId: cattleId });
    if (!latestData || !latestData.gpsLocation) {
      return ZoneStatus.Unknown;
    }

    for (const geoFence of geoFences) {
      const distance = this.findDistance(
        latestData.gpsLocation.latitude,
        geoFence.latitude,
        latestData.gpsLocation.longitude,
        geoFence.longitude
      );
      const geoFenceRadius = geoFence.radius;

      if (distance <= geoFenceRadius) {
        if (distance > geoFenceRadius - threshold) {
          return ZoneStatus.Warning;
        }
        return ZoneStatus.Safe;
      }
    }

    return ZoneStatus.Danger;
  };

  // Find the distance between 2 points in sphere (Earth)
  private static findDistance = (
    lat1: number,
    lat2: number,
    lng1: number,
    lng2: number
  ) => {
    const radiusOfEath = 6371e3;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = radiusOfEath * c;

    return distance;
  };
}
