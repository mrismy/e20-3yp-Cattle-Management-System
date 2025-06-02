import { Router } from 'express';
const notificationController = require('../../controller/notificationController');

const router = Router();

router.get('/', notificationController.getAll);

export { router as notificationRouter };
