import { mqttClient } from "../services/mqttClient"; // Import MQTT handler

export class CattleSensorData {
    // Define the boundaries for each sensor
    private static boundaries = {
        heartRate: { min: 60, max: 100 }, // Example: Normal range
        temperature: { min: 36, max: 39 }, // Example: Normal cattle body temp
        gpsGeofence: { // Example geofence for cattle area
            minLatitude: 6.772591, maxLatitude: 6.972591,
            minLongitude: 80.697847, maxLongitude: 80.897847
        }
    };

    // Function to check all sensor values
    public static checkSensors(cattleId: number): string[] {
        const alerts: string[] = [];

        // Fetch latest cattle data from MQTT storage
        const latestUpdate = mqttClient.getLatestUpdate();
        const cattleData = latestUpdate[cattleId];

        if (!cattleData) {
            return [`No data available for cattle ${cattleId}`];
        }

        // Check heart rate
        if (cattleData.heartRate < this.boundaries.heartRate.min ||
            cattleData.heartRate > this.boundaries.heartRate.max) {
            alerts.push(`🚨 Alert: Heart rate of cattle ${cattleId} is abnormal!`);
        }

        // Check temperature
        if (cattleData.temperature < this.boundaries.temperature.min ||
            cattleData.temperature > this.boundaries.temperature.max) {
            alerts.push(`🔥 Alert: Temperature of cattle ${cattleId} is abnormal!`);
        }

        // Check GPS location (geofence)
        if (cattleData.gpsLocation) {
            const { latitude, longitude } = cattleData.gpsLocation;
            if (latitude < this.boundaries.gpsGeofence.minLatitude ||
                latitude > this.boundaries.gpsGeofence.maxLatitude ||
                longitude < this.boundaries.gpsGeofence.minLongitude ||
                longitude > this.boundaries.gpsGeofence.maxLongitude) {
                alerts.push(`📍 Alert: Cattle ${cattleId} is out of the designated area!`);
            }
        }

        return alerts.length ? alerts : [`✅ Cattle ${cattleId} is healthy and within safe boundaries.`];
    }
}


