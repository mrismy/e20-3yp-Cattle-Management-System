import sensorData from "../../model/sensorData";
import { mqttClient } from "../../services/mqttClient";
import latestSensorData from "../../model/latestSensorData";
import dayjs from "dayjs";
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

router.get('/latest', async (req: any, res: any) => {
    try {
        const memoryData = mqttClient.getLatestUpdate(); // { deviceId1: {...}, deviceId2: {...}, ... }

        // Step 1: Get the latest DB record per deviceId
        const latestFromDB = await sensorData.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$deviceId",
                    doc: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);

        // Step 2: Replace DB entries with matching in-memory entries
        const finalData = latestFromDB.map(dbDoc => {
            const memDoc = memoryData[dbDoc.deviceId];
            return memDoc ? memDoc : dbDoc;
        });

        res.status(200).json(finalData);
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        res.status(500).json({ message: 'Error fetching sensor data' });
    }
});




// router.get('/latest',async (req:any,res:any)=>{
//     try {
//         const data = await latestSensorData.find();
//         res.status(200).json(data);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching sensor data' });
//     }
// })

router.get('/latestWithCattle', async (req: any, res: any) => {
    try {
        const memoryData = mqttClient.getLatestUpdate(); // { deviceId1: {...}, deviceId2: {...}, ... }

        // Step 1: Get the latest sensor data per deviceId from the DB
        let dbSensorData = await sensorData.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$deviceId",
                    doc: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$doc" } }
        ]);

        // Step 2: Replace DB entries with in-memory MQTT data if available
        const mergedSensorData = dbSensorData.map(dbDoc => {
            const memDoc = memoryData[dbDoc.deviceId];
            return memDoc ? memDoc : dbDoc;
        });

        // Step 3: Get all cattle info and create a Map for fast lookup
        const cattleList = await cattle.find();
        const cattleMap = new Map(cattleList.map(c => [c.tagId, c]));

        // Step 4: Enrich sensor data with cattle info and sensor status/action
        const result = await Promise.all(
            mergedSensorData.map(async (sensor) => {
                const deviceId = sensor.deviceId;
                const cattleInfo = cattleMap.get(deviceId);

                const { status, action } = await CattleSensorData.checkSensors(deviceId);

                return {
                    ...sensor,
                    cattleName: cattleInfo?.name || null,
                    cattleId: cattleInfo?.tagId || null,
                    cattleCreatedAt: cattleInfo?.createdAt || null,
                    status,
                    action,
                };
            })
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in /latestWithCattle:", error);
        res.status(500).json({ message: 'Error fetching sensor data with cattle information' });
    }
});



// Weekly
router.get('/withCattle/weekly/:weeks', async (req: any, res: any) => {
    try {
        const weeks = parseInt(req.params.weeks);
        if (isNaN(weeks) || weeks < 1) {
            return res.status(400).json({ message: 'Invalid number of weeks' });
        }

        const fromDate = dayjs().subtract(weeks, 'week').toDate();

        const sensorDataList = await sensorData.find({ createdAt: { $gte: fromDate } });
        const cattleList = await cattle.find();

        const cattleMap = new Map(cattleList.map(c => [c.tagId, c]));

        const result = await Promise.all(sensorDataList.map(async sensor => {
            const cattleInfo = sensor.deviceId != null ? cattleMap.get(sensor.deviceId) : undefined;
            const { status, action } = await CattleSensorData.checkSensors(sensor.deviceId as number);
            return {
                ...sensor.toObject(),
                cattleName: cattleInfo?.name || null,
                cattleId: cattleInfo?.tagId || null,
                cattleCreatedAt: cattleInfo?.createdAt || null,
                status,
                action,
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weekly sensor data with cattle' });
    }
});


// Monthly
router.get('/withCattle/monthly/:months', async (req: any, res: any) => {
    try {
        const months = parseInt(req.params.months);
        if (isNaN(months) || months < 1) {
            return res.status(400).json({ message: 'Invalid number of months' });
        }

        const fromDate = dayjs().subtract(months, 'month').toDate();
        console.log("Filter from date:", fromDate);

        

        const sensorDataList = await sensorData.find({ createdAt: { $gte: fromDate } });
        console.log("Sensor data count:", sensorDataList.length);

        const cattleList = await cattle.find();

        const cattleMap = new Map(cattleList.map(c => [c.tagId, c]));

        const result = await Promise.all(sensorDataList.map(async sensor => {
            const cattleInfo = sensor.deviceId != null ? cattleMap.get(sensor.deviceId) : undefined;
            const { status, action } = await CattleSensorData.checkSensors(sensor.deviceId as number);
            return {
                ...sensor.toObject(),
                cattleName: cattleInfo?.name || null,
                cattleId: cattleInfo?.tagId || null,
                cattleCreatedAt: cattleInfo?.createdAt || null,
                status,
                action,
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly sensor data with cattle' });
    }
});

router.get('/withCattle/byTag/:tagId', async (req: any, res: any) => {
    try {
        const tagId = parseInt(req.params.tagId);

        const sensorDataList = await sensorData.find({ deviceId: tagId });
        const cattleInfo = await cattle.findOne({ tagId });

        if (!cattleInfo) {
            return res.status(404).json({ message: 'Cattle not found' });
        }

        const result = await Promise.all(sensorDataList.map(async sensor => {
            const { status, action } = await CattleSensorData.checkSensors(sensor.deviceId as number);

            return {
                ...sensor.toObject(),
                cattleName: cattleInfo.name,
                cattleId: cattleInfo.tagId,
                cattleCreatedAt: cattleInfo.createdAt,
                status,
                action,
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sensor data for the given tag ID' });
    }
});

// Weekly data by tagId
router.get('/withCattle/weekly/:tagId/:weeks', async (req: any, res: any) => {
    try {
        const tagId = parseInt(req.params.tagId);
        const weeks = parseInt(req.params.weeks);

        if (isNaN(tagId) || isNaN(weeks) || weeks < 1) {
            return res.status(400).json({ message: 'Invalid tag ID or number of weeks' });
        }

        const fromDate = dayjs().subtract(weeks, 'week').toDate();

        const sensorDataList = await sensorData.find({
            deviceId: tagId,
            createdAt: { $gte: fromDate }
        });

        const cattleInfo = await cattle.findOne({ tagId });

        if (!cattleInfo) {
            return res.status(404).json({ message: 'Cattle not found' });
        }

        const result = await Promise.all(sensorDataList.map(async sensor => {
            const { status, action } = await CattleSensorData.checkSensors(sensor.deviceId as number);
            return {
                ...sensor.toObject(),
                cattleName: cattleInfo.name,
                cattleId: cattleInfo.tagId,
                cattleCreatedAt: cattleInfo.createdAt,
                status,
                action,
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weekly sensor data for tag ID' });
    }
});

// Monthly data by tagId
router.get('/withCattle/monthly/:tagId/:months', async (req: any, res: any) => { 
    try {
        const tagId = parseInt(req.params.tagId);
        const months = parseInt(req.params.months);

        if (isNaN(tagId) || isNaN(months) || months < 1) {
            return res.status(400).json({ message: 'Invalid tag ID or number of months' });
        }

        const fromDate = dayjs().subtract(months, 'month').toDate();

        const sensorDataList = await sensorData.find({
            deviceId: tagId,
            createdAt: { $gte: fromDate }
        });

        const cattleInfo = await cattle.findOne({ tagId });

        if (!cattleInfo) {
            return res.status(404).json({ message: 'Cattle not found' });
        }

        const result = await Promise.all(sensorDataList.map(async sensor => {
            const { status, action } = await CattleSensorData.checkSensors(sensor.deviceId as number);
            return {
                ...sensor.toObject(),
                cattleName: cattleInfo.name,
                cattleId: cattleInfo.tagId,
                cattleCreatedAt: cattleInfo.createdAt,
                status,
                action,
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly sensor data for tag ID' });
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