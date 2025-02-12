import mongoose from "mongoose";

const gpsLocation = new mongoose.Schema({
    
    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    }
})

const sensorDataSchema = new mongoose.Schema({

    deviceId:{
        type: Number,
        require: true
    },
    
    heartRate:{
        type: Number,
        required: true
    },

    temperature:{
        type: Number,
        required: true
    },

    gpsLocation:{
        type: gpsLocation,
        required: false
    }
})

const sensorData = mongoose.model('sensorData',sensorDataSchema)
export default sensorData;