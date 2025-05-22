import { Router } from 'express';
const geoFenceController = require('../../controller/geoFenceController');

const router = Router();

router.post('/new', geoFenceController.new);
router.get('/', geoFenceController.getAll);

export { router as geoFenceRouter };
