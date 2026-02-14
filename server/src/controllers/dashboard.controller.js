import * as dashboardService from '../services/dashboard.service.js';

export async function getSummary(req, res) {
  try {
    const summary = await dashboardService.getDashboardSummary(req.user.id);
    res.status(200).json({ status: 'success', data: { summary } });
  } catch (error) {
    console.error('[Dashboard getSummary]', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard summary' });
  }
}
