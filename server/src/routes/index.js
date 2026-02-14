import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import transactionRoutes from './transaction.routes.js';
import budgetRoutes from './budget.routes.js';
import goalRoutes from './goal.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import analyticsRoutes from './analytics.routes.js';
import aiRoutes from './ai.routes.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Protected routes
router.use('/categories', authenticate, categoryRoutes);
router.use('/transactions', authenticate, transactionRoutes);
router.use('/budgets', authenticate, budgetRoutes);
router.use('/goals', authenticate, goalRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/analytics', authenticate, analyticsRoutes);
router.use('/ai', authenticate, aiRoutes);

export default router;
