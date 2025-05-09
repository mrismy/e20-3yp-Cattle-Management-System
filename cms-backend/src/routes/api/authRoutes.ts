const { Router } = require('express');
const authController = require('../../controller/authController');
const refreshTokenController = require('../../controller/RefreshTokenController');

const router = Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/refresh', refreshTokenController.handleRefreshToken);

export { router as authRouter };
