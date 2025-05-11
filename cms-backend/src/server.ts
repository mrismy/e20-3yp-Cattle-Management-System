const express = require('express');
import mongoose from 'mongoose';
import { cattleRouter } from './routes/api/cattleRoutes';
import { sensorDataRouter } from './routes/api/sensorDataRoutes';
import { authRouter } from './routes/api/authRoutes';
import { mqttClient } from './services/mqttClient';
const cors = require('cors');
require('dotenv').config();
import verifyJWT from './middlewear/verifyJWT';
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
const DB_CONNECTION = process.env.DB_CONNECTION || '';

// Initilize server
const app = express();

// CORS options to allow only specific domains
const corsOptions = {
  origin: 'http://localhost:5173', // Replace with the allowed domain(s)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Optional: specify which HTTP methods are allowed
  allowedHeaders: ['Content-Type', 'Authorization'], // Optional: specify which headers are allowed
  credentials: true,
};

// Use the custom CORS options
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Middleware for cookie parsing
app.use(cookieParser());

app.get('/', (req: any, res: any) => {
  res.send('Hello world');
});

// Register the routes
app.use(authRouter);
app.use(verifyJWT); // Apply JWT verification middleware to all routes below this line
app.use('/api/cattle', cattleRouter);
app.use('/api/sensor', sensorDataRouter);

mongoose
  .connect(DB_CONNECTION)
  .then(() => {
    console.log('Database Connection successful');

    // Running the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.log('Connection failed ', err);
  });

// mqttClient.subscribe('iot/cattle');
