import express from 'express';
import { parseExpense, getInsights, checkHealth } from '../controllers/ai.controller.js';

const router = express.Router();

router.get('/health', checkHealth);
router.post('/parse-expense', parseExpense);
router.get('/insights', getInsights);

export default router;
