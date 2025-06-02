import { mqttClient } from '../services/mqttClient';

module.exports.getAll = async (req: any, res: any) => {
  try {
    const memoryData = await mqttClient.getLatestUpdate();
    console.log('data', memoryData);
  } catch (error) {
    console.error('Error fetching memory data:', error);
  }
};
