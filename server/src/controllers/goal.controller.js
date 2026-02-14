import * as goalService from '../services/goal.service.js';

export async function getGoals(req, res) {
  try {
    const goals = await goalService.getGoals(req.user.id);
    res.status(200).json({ status: 'success', data: { goals } });
  } catch (error) {
    console.error('[Goal getGoals]', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch goals' });
  }
}

export async function createGoal(req, res) {
  try {
    const { name, description, targetAmount, currentAmount, targetDate, status } = req.body;
    
    if (!name || !targetAmount) {
      return res.status(400).json({ status: 'error', message: 'Name and target amount are required' });
    }

    const data = {
      name,
      description,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate: targetDate ? new Date(targetDate) : null,
      status: status || 'ACTIVE'
    };

    const goal = await goalService.createGoal(req.user.id, data);
    res.status(201).json({ status: 'success', data: { goal } });
  } catch (error) {
    console.error('[Goal createGoal]', error);
    res.status(500).json({ status: 'error', message: 'Failed to create goal' });
  }
}

export async function updateGoal(req, res) {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.targetDate) data.targetDate = new Date(data.targetDate);

    const goal = await goalService.updateGoal(req.user.id, id, data);
    res.status(200).json({ status: 'success', data: { goal } });
  } catch (error) {
    console.error('[Goal updateGoal]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(404).json({ status: 'error', message: 'Goal not found' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to update goal' });
  }
}

export async function deleteGoal(req, res) {
  try {
    const { id } = req.params;
    await goalService.deleteGoal(req.user.id, id);
    res.status(200).json({ status: 'success', message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('[Goal deleteGoal]', error);
    if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
      return res.status(404).json({ status: 'error', message: 'Goal not found' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to delete goal' });
  }
}
