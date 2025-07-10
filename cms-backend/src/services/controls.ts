import latestSensorData from '../model/sensorData';
import geoFenceController = require('../controller/geoFenceController');
import geoFenceModel from '../model/geoFenceModel';
import sensorData from '../model/sensorData';
import { ThresholdModel } from '../model/sensorThresholdModel';
import cattle from '../model/cattle';

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

interface SensorDataInterface {
  deviceId: number;
  heartRate: number;
  temperature: number;
  gpsLocation?: {
    longitude: number;
    latitude: number;
  };
}

export class CattleSensorData {
  private static getThresholdValue = async () => {
    const threshold = await ThresholdModel.findById('global');
    if (!threshold) {
      throw new Error('Thresholds not found');
    }
    return threshold;
  };

  public static saftyStatus = async (sensor: SensorDataInterface) => {
    if (!sensor) {
      return 'no-data';
    }
    const cattleHeartRateStatus = await this.isHeartRateSafe(sensor);
    const cattleTemperatureStatus = await this.isTemperatureSafe(sensor);
    const cattleLocationStatus = await this.cattleZoneType(sensor);
    if (
      cattleHeartRateStatus === HeartRateStatus.Safe &&
      cattleTemperatureStatus === TemperatureStatus.Safe &&
      cattleLocationStatus === ZoneStatus.Safe
    ) {
      return 'safe';
    }
    return 'unsafe';
  };

  // Check if the temperature is safe for a specific cattle
  public static isTemperatureSafe = async (
    latestSensorData: SensorDataInterface
  ): Promise<TemperatureStatus> => {
    const threshold = await this.getThresholdValue();
    if (!threshold) {
      throw new Error('Thresholds not found');
    }
    if (!latestSensorData) {
      return TemperatureStatus.Danger;
    } else if (
      latestSensorData.temperature >= (threshold?.temperature?.min || 0) &&
      latestSensorData.temperature <= (threshold?.temperature?.max || 0)
    ) {
      return TemperatureStatus.Safe;
    }
    return TemperatureStatus.Danger;
  };

  // Check if the heart rate is safe for a specific cattle
  public static isHeartRateSafe = async (
    latestSensorData: SensorDataInterface
  ): Promise<HeartRateStatus> => {
    const threshold = await this.getThresholdValue();
    if (!threshold) {
      throw new Error('Thresholds not found');
    }

    if (!latestSensorData) {
      return HeartRateStatus.Danger;
    } else if (
      latestSensorData.heartRate >= (threshold?.heartRate?.min || 0) &&
      latestSensorData.heartRate <= (threshold?.heartRate?.max || 0)
    ) {
      return HeartRateStatus.Safe;
    }
    return HeartRateStatus.Danger;
  };

  // Check in which zone(Safe, warning, unsafe) a specific cattle is in
  public static cattleZoneType = async (
    latestSensorData: SensorDataInterface
  ): Promise<ZoneStatus> => {
    const threshold = await this.getThresholdValue();
    if (!threshold) throw new Error('Threshold not found');

    const warningBuffer = threshold?.geofence?.threshold || 0;

    const geoFences = await geoFenceModel.find();
    if (geoFences.length === 0) return ZoneStatus.Safe;

    if (!latestSensorData?.gpsLocation) return ZoneStatus.Unknown;

    let isInSafe = false;
    let isInWarning = false;

    for (const geoFence of geoFences) {
      const { latitude, longitude, radius, zoneType } = geoFence;
      const distance = this.findDistance(
        latestSensorData.gpsLocation.latitude,
        latitude,
        latestSensorData.gpsLocation.longitude,
        longitude
      );

      if (zoneType === 'safe') {
        if (distance <= radius - warningBuffer) {
          isInSafe = true;
        } else if (distance <= radius) {
          isInWarning = true;
        }
      } else if (zoneType === 'danger') {
        if (distance <= radius) {
          return ZoneStatus.Danger;
        } else if (distance <= radius + warningBuffer) {
          isInWarning = true;
        }
      }
    }

    if (isInWarning) return ZoneStatus.Warning;
    if (isInSafe) return ZoneStatus.Safe;

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
