import sensorData from "../../model/sensorData";
import { mqttClient } from "../../services/mqttClient";
import latestSensorData from "../../model/latestSensorData";

const express = require('express');
import cattle from "../../model/cattle";
import { CattleSensorData } from "../../services/controls";
const router = express.Router();

router.get('/',async (req:any,res:any)=>{
    try {
        const data = await sensorData.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sensor data' });
    }
})

// router.get('/location',(req:any,res:any)=>{
//     try {
//         const update = mqttClient.getLatestUpdate();
//         console.log(update);
//         res.status(200).json(update);
//     } catch (error) {
//         console.error('Failed to subscribe:', error);
//     }
// })

router.get('/withCattle', async (req: any, res: any) => {
    try {
        const sensorDataList = await sensorData.find();
        const cattleList = await cattle.find();

        // Create a Map for quick lookup (tagId -> cattle info)
        const cattleMap = new Map(cattleList.map(c => [c.tagId, c]));

        const result = await Promise.all(sensorDataList.map(async sensor => {
            const cattleInfo = sensor.deviceId !== null && sensor.deviceId !== undefined ? cattleMap.get(sensor.deviceId) : undefined;
            
            // Get status and action from checkSensors
            const { status, action } = await CattleSensorData.checkSensors(sensor.deviceId as number);

            return {
                ...sensor.toObject(),
                cattleName: cattleInfo ? cattleInfo.name : null,
                cattleId: cattleInfo ? cattleInfo.tagId : null,
                cattleCreatedAt: cattleInfo ? cattleInfo.createdAt : null,
                status,
                action,
            };
        })
    );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sensor data with cattle information' });
    }
});

router.get('/latest',async (req:any,res:any)=>{
    try {
        const data = await latestSensorData.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sensor data' });
    }
})

router.get('/latestWithCattle', async (req: any, res: any) => {
    try {
        const sensorDataList = await latestSensorData.find();
        const cattleList = await cattle.find();

        // Create a Map for quick lookup (tagId -> cattle info)
        const cattleMap = new Map(cattleList.map(c => [c.tagId, c]));

        const result = await Promise.all(sensorDataList.map(async sensor => {
            const cattleInfo = sensor.deviceId !== null && sensor.deviceId !== undefined ? cattleMap.get(sensor.deviceId) : undefined;

             // Get status and action from checkSensors
             const { status, action } = await CattleSensorData.checkSensors(sensor.deviceId as number);
            return {
                ...sensor.toObject(),
                cattleName: cattleInfo ? cattleInfo.name : null,
                cattleId: cattleInfo ? cattleInfo.tagId : null,
                cattleCreatedAt: cattleInfo ? cattleInfo.createdAt : null,
                status,
                action,
            };
        })
    );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sensor data with cattle information' });
    }
});

router.get('/alert/:Id',async (req:any,res:any)=>{
    try {
        const { status, action } = await CattleSensorData.checkSensors(req.params.Id);
        res.status(200).json(action);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sensor data' });
    }
})

export {router as sensorDataRouter}