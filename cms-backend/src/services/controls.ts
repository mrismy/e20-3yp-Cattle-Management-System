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

interface CattleDataInterface {
  heartRate: number;
  temperature: number;
}

export class CattleSensorData {
  private static getThresholdValue = async () => {
    const threshold = await ThresholdModel.findById('global');
    if (!threshold) {
      throw new Error('Thresholds not found');
    }
    return threshold;
  };

  public static saftyStatus = async (deviceId: number) => {
    const cattleHeartRateStatus = await this.isHeartRateSafe(deviceId);
    const cattleTemperatureStatus = await this.isTemperatureSafe(deviceId);
    if (
      cattleHeartRateStatus === HeartRateStatus.Safe &&
      cattleTemperatureStatus === TemperatureStatus.Safe
    ) {
      return 'safe';
    }
    return 'unsafe';
  };

  // Get the latest sensor data for a specific device
  public static getLatestSensorData = async (
    deviceId: number
  ): Promise<CattleDataInterface | null> => {
    const latestSensorData = await sensorData
      .findOne({ deviceId })
      .sort({ timestamp: -1 })
      .limit(1);
    if (!latestSensorData) {
      return null;
    }
    return {
      heartRate: latestSensorData.heartRate,
      temperature: latestSensorData.temperature,
    };
  };

  // Check if the temperature is safe for a specific cattle
  public static isTemperatureSafe = async (
    deviceId: number
  ): Promise<TemperatureStatus> => {
    const threshold = await this.getThresholdValue();
    if (!threshold) {
      throw new Error('Thresholds not found');
    }
    const latestSensorData = await this.getLatestSensorData(deviceId);
    console.log(latestSensorData);

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
    deviceId: number
  ): Promise<HeartRateStatus> => {
    const threshold = await this.getThresholdValue();
    if (!threshold) {
      throw new Error('Thresholds not found');
    }
    const latestData = await this.getLatestSensorData(deviceId);

    if (!latestData) {
      return HeartRateStatus.Danger;
    } else if (
      latestData.heartRate >= (threshold?.heartRate?.min || 0) &&
      latestData.heartRate <= (threshold?.heartRate?.max || 0)
    ) {
      return HeartRateStatus.Safe;
    }
    return HeartRateStatus.Danger;
  };

  // Check in which zone(Safe, warning, unsafe) a specific cattle is in
  public static cattleZoneType = async (
    deviceId: number
  ): Promise<ZoneStatus> => {
    const threshold = await this.getThresholdValue();
    if (!threshold) throw new Error('Threshold not found');

    const warningBuffer = threshold?.geofence?.threshold || 0;

    const geoFences = await geoFenceModel.find();
    if (geoFences.length === 0) return ZoneStatus.Safe;

    const latestData = await latestSensorData.findOne({ deviceId });
    if (!latestData?.gpsLocation) return ZoneStatus.Unknown;

    let isInSafe = false;
    let isInWarning = false;

    for (const geoFence of geoFences) {
      const { latitude, longitude, radius, zoneType } = geoFence;
      const distance = this.findDistance(
        latestData.gpsLocation.latitude,
        latitude,
        latestData.gpsLocation.longitude,
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
