import * as budgetService from '../services/budget.service.js';

export async function getBudgets(req, res) {
  try {
    const budgets = await budgetService.getBudgets(req.user.id);
    res.status(200).json({ status: 'success', data: { budgets } });
  } catch (error) {
    console.error('[Budget getBudgets]', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch budgets' });
  }
}

export async function createBudget(req, res) {
  try {
    const { categoryId, amount, period, startDate, endDate } = req.body;
    
    if (!categoryId || !amount || !startDate) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const data = {
      categoryId,
      amount,
      period: period || 'MONTHLY',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null
    };

    const budget = await budgetService.createBudget(req.user.id, data);
    res.status(201).json({ status: 'success', data: { budget } });
  } catch (error) {
    console.error('[Budget createBudget]', error);
    if (error.message === 'INVALID_CATEGORY') {
      return res.status(400).json({ status: 'error', message: 'Invalid or unauthorized category' });
    }
    if (error.message === 'BUDGET_EXISTS') {
      return res.status(409).json({ status: 'error', message: 'Budget for this category and period already exists' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to create budget' });
  }
}

export async function updateBudget(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };// spread needs {}
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const budget = await budgetService.updateBudget(req.user.id, id, data);
    res.status(200).json({ status: 'success', data: { budget } });
  } catch (error) {
    console.error('[Budget updateBudget]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }
    if (error.message === 'INVALID_CATEGORY') {
      return res.status(400).json({ status: 'error', message: 'Invalid or unauthorized category' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to update budget' });
  }
}

export async function deleteBudget(req, res) {
  try {
    const { id } = req.params;
    await budgetService.deleteBudget(req.user.id, id);
    res.status(200).json({ status: 'success', message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('[Budget deleteBudget]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(404).json({ status: 'error', message: 'Budget not found' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to delete budget' });
  }
}
