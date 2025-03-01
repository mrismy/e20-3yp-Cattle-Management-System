import mongoose from 'mongoose';
import moment from "moment-timezone";

const cattleSchema = new mongoose.Schema({
    tagId:{
        type: Number,
        required: true,
        unique: true
    },

    name:{
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);


const Cattle = mongoose.model('cattle',cattleSchema)
export default Cattle;