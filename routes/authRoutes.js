import express from 'express';
import { Login, Register, Check, Logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', Register);
router.post('/login', Login);
router.get('/check', Check);
router.post('/logout', Logout);

export default router;