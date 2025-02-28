import express, { Request, Response } from 'express';
import Cattle from '../../model/cattle';
import { cattleInterface } from '../../types/cattleInterface';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const cattle = await Cattle.find();
        res.status(200).json(cattle);
    } catch (error: any) {
        console.error('Error fetching cattle:', error);
        res.status(500).json({ message: 'Error fetching cattle data', error: error.message });
    }
});

router.get('/:tagId', async (req: any, res: any) => {
    try {
        const cattle = await Cattle.findOne({ tagId: req.params.tagId });
        if (!cattle) {
            return res.status(404).json({ message: "Cattle not found" });
        }
        res.status(200).json(cattle);
    } catch (error: any) {
        console.error('Error fetching cattle:', error);
        res.status(500).json({ message: 'Error fetching cattle data', error: error.message });
    }
});


router.post('/', async (req: any, res: any) => {
    const { tagId, name }: cattleInterface = req.body;

    if (!tagId || !name) {
        return res.status(400).json({ message: "Missing required field" });
    }

    try {
        const existingCattle = await Cattle.findOne({ tagId });
        if (existingCattle) {
            return res.status(400).json({ message: "Cattle with this tagId already exists" });
        }

        const newCattle = new Cattle({ tagId, name });
        await newCattle.save();
        res.status(201).json({ message: "Cattle added successfully", cattle: newCattle });
    } catch (error: any) {
        console.error('Error creating cattle:', error);
        res.status(500).json({ message: 'Error creating cattle', error: error.message });
    }
});

router.put('/:tagId',async(req: any,res:any) =>{
    try{
        const { tagId, name }: cattleInterface = req.body;

        if (!tagId || !name) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingCattle = await Cattle.findOne({ tagId: req.params.tagId });
        if (!existingCattle) {
            return res.status(404).json({ message: "Cattle not found" });
        }

        const updatedCattle = await Cattle.findOneAndUpdate(
            { tagId: req.params.tagId }, // Find by tagId
            { tagId, name }, // Update values
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Cattle updated successfully", cattle: updatedCattle });

    }catch (error: any) {
        console.error('Error updating cattle:', error);
        res.status(500).json({ message: 'Error updating cattle', error: error.message });
    }
});

router.delete('/:tagId',async(req:any,res:any)=>{
    try{
        
        const deletedCattle = await Cattle.findOneAndDelete({tagId: req.params.tagId});
        if(!deletedCattle){
            return res.status(404).json({ message: 'Cattle not found' });
        }
        res.status(200).json({ message: "Cattle deleted successfully" });

    }catch (error: any) {
        console.error('Error deleting cattle:', error);
        res.status(500).json({ message: 'Error deleting cattle', error: error.message });
    }
});


export { router as cattleRouter };
