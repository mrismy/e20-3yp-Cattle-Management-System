// routes.api.cattle.js

import Cattle from "../../model/cattle";
import { cattleInterface } from "../../types/cattleInterface";

const express = require('express')
const router = express.Router();

router.get('/',async (req:any,res:any)=>{
    try {
        const cattle = await Cattle.find();
        res.status(200).json(cattle);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching cattle data' });
      }
})

router.post('/',async (req:any,res:any)=>{
    const {tagId,name}:cattleInterface = req.body;

    // Validate required fields are not null
    if (!tagId || !name) {
        res.status(400).json({message:"Missing required field"})
    }

    try {
        const newCattle = new Cattle({tagId,name})
        await newCattle.save();
        res.status(201).json({message:"Cattled added successfully", cattle:newCattle})
    } catch (error) {
        res.status(500).json({ message: 'Error creating cattle' });
    }
})

export {router as cattleRouter}