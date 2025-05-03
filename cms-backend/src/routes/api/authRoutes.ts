const { Router } = require('express');
const authController = require('../../controller/authController');

const router = Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);

export { router as authRouter };
