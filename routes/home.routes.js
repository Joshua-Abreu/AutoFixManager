import express from 'express';
import { GetDashboard } from '../controllers/HomeController.js';

const router = express.Router();

router.get('/', GetDashboard);

export default router;