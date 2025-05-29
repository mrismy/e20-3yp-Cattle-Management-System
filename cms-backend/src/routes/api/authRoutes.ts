import { Router, RequestHandler } from 'express';
import {
  login,
  signup,
  logout,
  changePassword,
  getUserDetails
} from '../../controller/authController';
import { handleRefreshToken } from '../../controller/refreshTokenController';
import verifyJWT from '../../middlewear/verifyJWT';

const router = Router();

// Auth routes
router.post('/login', login as RequestHandler);
router.post('/signup', signup as RequestHandler);
router.post('/change-password', verifyJWT as RequestHandler, changePassword as RequestHandler);
router.get('/refresh', handleRefreshToken as RequestHandler);
router.get('/logout', logout as RequestHandler);
router.get('/user-details', verifyJWT as RequestHandler, getUserDetails as RequestHandler);

export default router;