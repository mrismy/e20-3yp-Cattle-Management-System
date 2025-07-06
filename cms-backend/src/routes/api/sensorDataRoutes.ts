import sensorData from '../../model/sensorData';
import { mqttClient } from '../../services/mqttClient';
import latestSensorData from '../../model/latestSensorData';
import dayjs from 'dayjs';
const express = require('express');
import cattle from '../../model/cattle';
import { CattleSensorData } from '../../services/controls';
const router = express.Router();

router.get('/', async (req: any, res: any) => {
  try {
    const data = await sensorData.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor data' });
  }
});

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
    const cattleMap = new Map(cattleList.map((c) => [c.deviceId, c]));

    const result = await Promise.all(
      sensorDataList.map(async (sensor) => {
        const cattleInfo =
          sensor.deviceId !== null && sensor.deviceId !== undefined
            ? cattleMap.get(sensor.deviceId)
            : undefined;

        // Get status and action from checkSensors
        const status = await CattleSensorData.saftyStatus(
          sensor.deviceId as number
        );

        return {
          ...sensor.toObject(),
          cattleId: cattleInfo ? cattleInfo.deviceId : null,
          cattleCreatedAt: cattleInfo ? cattleInfo.createdAt : null,
          status,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching sensor data with cattle information' });
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
          _id: '$deviceId',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ]);

    // Step 2: Replace DB entries with matching in-memory entries
    const finalData = latestFromDB.map((dbDoc) => {
      const memDoc = memoryData[dbDoc.deviceId];
      return memDoc ? memDoc : dbDoc;
    });

    res.status(200).json(finalData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
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
          _id: '$deviceId',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ]);

    // Step 2: Replace DB entries with in-memory MQTT data if available
    const mergedSensorData = dbSensorData.map((dbDoc) => {
      const memDoc = memoryData[dbDoc.deviceId];
      return memDoc ? memDoc : dbDoc;
    });

    // Step 3: Get all cattle info and create a Map for fast lookup
    const cattleList = await cattle.find();
    const cattleMap = new Map(cattleList.map((c) => [c.deviceId, c]));

    // Step 4: Enrich sensor data with cattle info and sensor status/action
    const result = await Promise.all(
      mergedSensorData.map(async (sensor) => {
        const deviceId = sensor.deviceId;
        const cattleInfo = cattleMap.get(deviceId);

        const status = await CattleSensorData.saftyStatus(deviceId);

        return {
          ...sensor,
          // cattleName: cattleInfo?.name || null,
          cattleId: cattleInfo?.cattleId || null,
          deviceId: cattleInfo?.deviceId || null,
          cattleCreatedAt: cattleInfo?.createdAt || null,
          status,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in /latestWithCattle:', error);
    res
      .status(500)
      .json({ message: 'Error fetching sensor data with cattle information' });
  }
});

// Get the hourly sensor data of a specific cattle for a specific day
router.get('/withCattle/day/:date/:cattleId', async (req: any, res: any) => {
  try {
    const dateString = req.params.date;
    const cattleId = req.params.cattleId;
    const formattedDate = dayjs(dateString);

    if (!formattedDate.isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const startOfDay = formattedDate.startOf('day').toDate();
    const endOfDay = formattedDate.endOf('day').toDate();

    // Fetch the sensor data from the database for the specific cattle
    const sensorDataList = await sensorData.find({
      deviceId: cattleId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Find the specific cattle
    const cattleInfo = await cattle.findOne({ tagId: cattleId });
    if (!cattleInfo) {
      return res.status(404).json({ message: 'Cattle not found' });
    }

    // Process data into hourly averages
    const hourlyAverages = new Map<
      string,
      {
        heartRate: { sum: number; count: number };
        temperature: { sum: number; count: number };
        hour: string;
      }
    >();

    for (const sensor of sensorDataList) {
      const hour = dayjs(sensor.createdAt).format('YYYY-MM-DDTHH:00:00'); // Group by hour

      // Initialize if not exists
      if (!hourlyAverages.has(hour)) {
        hourlyAverages.set(hour, {
          heartRate: { sum: 0, count: 0 },
          temperature: { sum: 0, count: 0 },
          hour,
        });
      }

      const current = hourlyAverages.get(hour)!;

      // Only include non-zero values in averages
      if (sensor.heartRate > 0) {
        current.heartRate.sum += sensor.heartRate;
        current.heartRate.count++;
      }

      if (sensor.temperature > 0) {
        current.temperature.sum += sensor.temperature;
        current.temperature.count++;
      }
    }

    // Convert to final response format
    const result = Array.from(hourlyAverages.values()).map((item) => ({
      cattleId: cattleInfo.deviceId,
      hour: item.hour,
      avgHeartRate:
        item.heartRate.count > 0
          ? Math.round(item.heartRate.sum / item.heartRate.count)
          : null,
      avgTemperature:
        item.temperature.count > 0
          ? Math.round((item.temperature.sum / item.temperature.count) * 10) /
            10
          : null,
    }));

    // Sort results by hour
    result.sort((a, b) => a.hour.localeCompare(b.hour));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error fetching daily sensor data for cattle' });
  }
});

// Weekly
// router.get('/withCattle/weekly/:weeks', async (req: any, res: any) => {
//   try {
//     const weeks = parseInt(req.params.weeks);
//     if (isNaN(weeks) || weeks < 1) {
//       return res.status(400).json({ message: 'Invalid number of weeks' });
//     }

//     const fromDate = dayjs().subtract(weeks, 'week').toDate();

//     const sensorDataList = await sensorData.find({
//       createdAt: { $gte: fromDate },
//     });
//     const cattleList = await cattle.find();

//     const cattleMap = new Map(cattleList.map((c) => [c.deviceId, c]));

//     const result = await Promise.all(
//       sensorDataList.map(async (sensor) => {
//         const cattleInfo =
//           sensor.deviceId != null ? cattleMap.get(sensor.deviceId) : undefined;
//         const { status, action } = await CattleSensorData.checkSensors(
//           sensor.deviceId as number
//         );
//         return {
//           ...sensor.toObject(),
//           cattleId: cattleInfo?.deviceId || null,
//           cattleCreatedAt: cattleInfo?.createdAt || null,
//           status,
//           action,
//         };
//       })
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: 'Error fetching weekly sensor data with cattle' });
//   }
// });

// // Monthly
// router.get('/withCattle/monthly/:months', async (req: any, res: any) => {
//   try {
//     const months = parseInt(req.params.months);
//     if (isNaN(months) || months < 1) {
//       return res.status(400).json({ message: 'Invalid number of months' });
//     }

//     const fromDate = dayjs().subtract(months, 'month').toDate();
//     console.log('Filter from date:', fromDate);

//     const sensorDataList = await sensorData.find({
//       createdAt: { $gte: fromDate },
//     });
//     console.log('Sensor data count:', sensorDataList.length);

//     const cattleList = await cattle.find();

//     const cattleMap = new Map(cattleList.map((c) => [c.deviceId, c]));

//     const result = await Promise.all(
//       sensorDataList.map(async (sensor) => {
//         const cattleInfo =
//           sensor.deviceId != null ? cattleMap.get(sensor.deviceId) : undefined;
//         const { status, action } = await CattleSensorData.checkSensors(
//           sensor.deviceId as number
//         );
//         return {
//           ...sensor.toObject(),
//           cattleId: cattleInfo?.deviceId || null,
//           cattleCreatedAt: cattleInfo?.createdAt || null,
//           status,
//           action,
//         };
//       })
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: 'Error fetching monthly sensor data with cattle' });
//   }
// });

// router.get('/withCattle/byTag/:tagId', async (req: any, res: any) => {
//   try {
//     const tagId = parseInt(req.params.tagId);

//     const sensorDataList = await sensorData.find({ deviceId: tagId });
//     const cattleInfo = await cattle.findOne({ tagId });

//     if (!cattleInfo) {
//       return res.status(404).json({ message: 'Cattle not found' });
//     }

//     const result = await Promise.all(
//       sensorDataList.map(async (sensor) => {
//         const { status, action } = await CattleSensorData.checkSensors(
//           sensor.deviceId as number
//         );

//         return {
//           ...sensor.toObject(),
//           cattleId: cattleInfo.deviceId,
//           cattleCreatedAt: cattleInfo.createdAt,
//           status,
//           action,
//         };
//       })
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: 'Error fetching sensor data for the given tag ID' });
//   }
// });

// // Weekly data by tagId
// router.get('/withCattle/weekly/:tagId/:weeks', async (req: any, res: any) => {
//   try {
//     const tagId = parseInt(req.params.tagId);
//     const weeks = parseInt(req.params.weeks);

//     if (isNaN(tagId) || isNaN(weeks) || weeks < 1) {
//       return res
//         .status(400)
//         .json({ message: 'Invalid tag ID or number of weeks' });
//     }

//     const fromDate = dayjs().subtract(weeks, 'week').toDate();

//     const sensorDataList = await sensorData.find({
//       deviceId: tagId,
//       createdAt: { $gte: fromDate },
//     });

//     const cattleInfo = await cattle.findOne({ tagId });

//     if (!cattleInfo) {
//       return res.status(404).json({ message: 'Cattle not found' });
//     }

//     const result = await Promise.all(
//       sensorDataList.map(async (sensor) => {
//         const { status, action } = await CattleSensorData.checkSensors(
//           sensor.deviceId as number
//         );
//         return {
//           ...sensor.toObject(),
//           cattleId: cattleInfo.deviceId,
//           cattleCreatedAt: cattleInfo.createdAt,
//           status,
//           action,
//         };
//       })
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: 'Error fetching weekly sensor data for tag ID' });
//   }
// });

// // Monthly data by tagId
// router.get('/withCattle/monthly/:tagId/:months', async (req: any, res: any) => {
//   try {
//     const tagId = parseInt(req.params.tagId);
//     const months = parseInt(req.params.months);

//     if (isNaN(tagId) || isNaN(months) || months < 1) {
//       return res
//         .status(400)
//         .json({ message: 'Invalid tag ID or number of months' });
//     }

//     const fromDate = dayjs().subtract(months, 'month').toDate();

//     const sensorDataList = await sensorData.find({
//       deviceId: tagId,
//       createdAt: { $gte: fromDate },
//     });

//     const cattleInfo = await cattle.findOne({ tagId });

//     if (!cattleInfo) {
//       return res.status(404).json({ message: 'Cattle not found' });
//     }

//     const result = await Promise.all(
//       sensorDataList.map(async (sensor) => {
//         const { status, action } = await CattleSensorData.checkSensors(
//           sensor.deviceId as number
//         );
//         return {
//           ...sensor.toObject(),
//           cattleId: cattleInfo.deviceId,
//           cattleCreatedAt: cattleInfo.createdAt,
//           status,
//           action,
//         };
//       })
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: 'Error fetching monthly sensor data for tag ID' });
//   }
// });

// router.get('/alert/:Id', async (req: any, res: any) => {
//   try {
//     const { status, action } = await CattleSensorData.checkSensors(
//       req.params.Id
//     );
//     res.status(200).json(action);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching sensor data' });
//   }
// });

export { router as sensorDataRouter };
