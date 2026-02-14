import * as analyticsService from '../services/analytics.service.js';

export async function getOverview(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const overview = await analyticsService.getOverview(req.user.id, startDate, endDate);
    res.status(200).json({ status: 'success', data: { overview } });
  } catch (error) {
    console.error('[Analytics getOverview]', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch analytics overview' });
  }
}
