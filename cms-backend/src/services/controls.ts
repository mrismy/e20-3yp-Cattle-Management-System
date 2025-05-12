import latestSensorData from "../model/latestSensorData";

export class CattleSensorData {
    private static boundaries = {
        heartRate: { min: 60, max: 100 }, 
        temperature: { min: 36, max: 39 }, 
        gpsGeofence: { 
            minLatitude: 6.772591, maxLatitude: 6.972591,
            minLongitude: 80.697847, maxLongitude: 80.897847
        }
    };

    public static async checkSensors(cattleId: number): Promise<{ status: string, action: number[] }> {
        let status: string = "safe";
        let action: number[] = [];

        const latestData = await latestSensorData.findOne({ deviceId: cattleId });

        if (!latestData) {
            return {
                status: "unsafe",
                action: [0]
            };
        }

        const cattleData = latestData.toObject();

        if (cattleData.heartRate < this.boundaries.heartRate.min ||
            cattleData.heartRate > this.boundaries.heartRate.max) {
            action.push(2);  
            status: "unsafe"
        }

        if (cattleData.temperature < this.boundaries.temperature.min ||
            cattleData.temperature > this.boundaries.temperature.max) {
            action.push(3);  
            status: "unsafe"
        }

        if (cattleData.gpsLocation) {
            const { latitude, longitude } = cattleData.gpsLocation;
            if (latitude < this.boundaries.gpsGeofence.minLatitude ||
                latitude > this.boundaries.gpsGeofence.maxLatitude ||
                longitude < this.boundaries.gpsGeofence.minLongitude ||
                longitude > this.boundaries.gpsGeofence.maxLongitude) {
                action.push(4);  
                status: "unsafe"
            }
        }


        if (action.length === 0) {
            return {
                status: "safe",
                action: [1]  
            };
        }

        return {
            status,
            action
        };
    }
}
