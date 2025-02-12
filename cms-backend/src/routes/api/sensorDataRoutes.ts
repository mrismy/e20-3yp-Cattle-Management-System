import sensorData from "../../model/sensorData";
import { mqttClient } from "../../services/mqttClient";

const express = require('express');
const router = express.Router();

router.get('/',async (req:any,res:any)=>{
    try {
        const data = await sensorData.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sensor data' });
    }
})

router.get('/location',(req:any,res:any)=>{
    try {
        const update = mqttClient.getLatestUpdate();
        console.log(update);
        res.status(200).json(update);
    } catch (error) {
        console.error('Failed to subscribe:', error);
    }
})

export {router as sensorDataRouter}