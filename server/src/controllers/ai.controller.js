import { PrismaClient } from '@prisma/client';
import * as aiService from '../services/ai.service.js';

const prisma = new PrismaClient();

export const checkHealth = async (req, res) => {
  const isHealthy = await aiService.checkOllamaHealth();
  res.json({ ai: isHealthy ? 'connected' : 'unavailable' });
};

export const parseExpense = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Valid text input is required.' });
    }

    const isHealthy = await aiService.checkOllamaHealth();
    if (!isHealthy) {
      return res.status(503).json({ message: 'AI Provider is temporarily unavailable.' });
    }

    // Fetch user's categories to map LLM output
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { isDefault: true }
        ]
      }
    });

    const parsedData = await aiService.parseExpenseText(text, categories, new Date());
    
    // We return it as a candidate payload, we do NOT save it to DB directly here.
    res.json({ candidate: parsedData });
  } catch (error) {
    console.error('[AI Parse Error]', error);
    res.status(500).json({ message: error.message || 'Failed to process AI parsing.' });
  }
};

export const getInsights = async (req, res) => {
  try {
    const isHealthy = await aiService.checkOllamaHealth();
    if (!isHealthy) {
      return res.status(503).json({ message: 'AI Provider is temporarily unavailable.' });
    }

    // 1. Gather deterministic financial context
    // This aggregates some simple stats to give to the LLM.
    const userId = req.user.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [transactions, budgets, goals] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, transactionDate: { gte: startOfMonth } },
        include: { category: true }
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { category: true }
      }),
      prisma.goal.findMany({
        where: { userId, status: 'ACTIVE' }
      })
    ]);

    let income = 0;
    let expense = 0;
    const categoryTotals = {};

    transactions.forEach(tx => {
      const amt = Number(tx.amount);//typecasting as prisma has datatype decimal but js has Number
      if (tx.type === 'INCOME') income += amt;
      else {
        expense += amt;
        const catName = tx.category?.name || 'Other';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + amt;
      }
    });

    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    const budgetSummaries = budgets.map(b => ({
      category: b.category?.name || 'Unknown',
      limit: Number(b.amount),
      // Normally we calculate spent, but for a simple context we'll approximate from this month's tx
      spent: categoryTotals[b.category?.name || 'Unknown'] || 0
    }));

    const goalSummaries = goals.map(g => ({
      name: g.name,
      target: Number(g.targetAmount),
      current: Number(g.currentAmount),
      progressPercent: Number(g.targetAmount) > 0 ? (Number(g.currentAmount) / Number(g.targetAmount)) * 100 : 0
    }));

    const financialContext = {
      monthIncome: income,
      monthExpense: expense,
      savingsRate: savingsRate.toFixed(1) + '%',
      topCategories: Object.entries(categoryTotals).sort((a,b) => b[1]-a[1]).slice(0, 3).map(([k,v]) => `${k}: ${v}`),
      activeBudgets: budgetSummaries,
      activeGoals: goalSummaries
    };

    // 2. Call LLM
    const insightText = await aiService.generateInsights(financialContext);

    res.json({ insightText });
  } catch (error) {
    console.error('[AI Insight Error]', error);
    res.status(500).json({ message: error.message || 'Failed to generate financial insights.' });
  }
};
