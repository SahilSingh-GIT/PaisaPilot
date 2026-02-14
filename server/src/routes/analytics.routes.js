import { Router } from 'express';
import { getOverview } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/overview', getOverview);

export default router;
