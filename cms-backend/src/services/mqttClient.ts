import mqtt, { MqttClient, ISubscriptionGrant } from 'mqtt';
import { SensorDataInterface } from '../types/sensorDataInterface';

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost';

interface CattleData {
    heartRate: number;
    temperature: number;
    gpsLocation?: {
        latitude: number;
        longitude: number;
      };
      timestamp: string
}

class MqttHandler {
    private static instance: MqttHandler;
    private client: MqttClient;
    private isConnected = false;
    private latestupdate: Record<number,CattleData> = {};

    private constructor() {
        this.client = mqtt.connect(MQTT_BROKER);

        this.client.on('error', (err) => {
            console.error('MQTT error:', err);
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            console.log('Connected to MQTT broker');
        });

        this.client.on('close', () => {
            this.isConnected = false;
            console.log('Disconnected from MQTT broker');
        });

        // Ensure only ONE message listener is attached globally
        this.client.on('message', (receivedTopic, message) => {
            try {
                const data = JSON.parse(message.toString());
                const receivedMsg: SensorDataInterface = data;
                const {deviceId, heartRate, temperature, gpsLocation}= receivedMsg;
                
                if (deviceId) {
                    this.latestupdate[deviceId] = {
                        heartRate,
                        temperature,
                        gpsLocation,
                        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                    };
                    console.log(`Updated data for Cow ${deviceId}:`, this.latestupdate[deviceId]);
                }

            } catch (error) {
                console.error("Error parsing MQTT message:", error);
            }
        });
    }

    public static getInstance(): MqttHandler {
        if (!MqttHandler.instance) {
            MqttHandler.instance = new MqttHandler();
        }
        return MqttHandler.instance;
    }

    public getClient(): MqttClient {
        if (!this.isConnected) {
            throw new Error('MQTT client not connected');
        }
        return this.client;
    }

    public publish(topic: string, message: string, options?: mqtt.IClientPublishOptions): void {
        if (!this.isConnected) {
            throw new Error('MQTT client not connected');
        }
        this.client.publish(topic, message, options, (err) => {
            if (err) {
                console.error(`Failed to publish to ${topic}:`, err);
            } else {
                console.log(`Published to ${topic}: ${message}`);
            }
        });
    }

    public subscribe(
        topic: string,
        options?: mqtt.IClientSubscribeOptions
    ): void {
        if (!this.isConnected) {
            console.warn(`MQTT client not connected. Retrying subscription to ${topic} in 2 seconds.`);
            setTimeout(() => this.subscribe(topic, options), 2000);
            return;
        }

        this.client.subscribe(topic, options, (err, granted) => {
            if (err) {
                console.error(`Failed to subscribe to ${topic}:`, err);
            } else {
                console.log(`Subscribed to ${topic}`);
                if (granted) {
                    granted.forEach((grant) => {
                        console.log(`Granted QoS: ${grant.qos} for topic: ${grant.topic}`);
                    });
                }
            }
        });
    }

    public getLatestUpdate(): Record<number,CattleData>{
        return this.latestupdate;
    }
}

// Export singleton instance
export const mqttClient = MqttHandler.getInstance();
