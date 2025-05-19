import mongoose from 'mongoose';

const geoFenceSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  radius: {
    type: Number,
    required: true,
  },
});

const geoFenceModel = mongoose.model('GeoFence', geoFenceSchema);
export default geoFenceModel;
