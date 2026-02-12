import { prisma } from '../config/db.js';

export async function getOverview(userId, startDateStr, endDateStr) {
  // Default to past 6 months if not provided
  const now = new Date();
  let endDate = endDateStr ? new Date(endDateStr) : now;
  let startDate = startDateStr ? new Date(startDateStr) : new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { category: true }
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categorySpending = {}; // { "Food": { amount: 100, color: '#000' } }
  const trends = {}; // { "2023-01": { income: 0, expense: 0 } }

  transactions.forEach(t => {
    const amt = Number(t.amount);
    const monthKey = t.transactionDate.toISOString().substring(0, 7); // YYYY-MM
    
    if (!trends[monthKey]) {
      trends[monthKey] = { name: monthKey, income: 0, expense: 0 };
    }

    if (t.type === 'INCOME') {
      totalIncome += amt;
      trends[monthKey].income += amt;
    } else if (t.type === 'EXPENSE') {
      totalExpense += amt;
      trends[monthKey].expense += amt;

      const catName = t.category.name;
      if (!categorySpending[catName]) {
        categorySpending[catName] = { name: catName, value: 0, color: t.category.color };
      }
      categorySpending[catName].value += amt;
    }
  });

  const categoryBreakdown = Object.values(categorySpending).sort((a, b) => b.value - a.value);
  const trendData = Object.values(trends).sort((a, b) => a.name.localeCompare(b.name));//loaclcompae is string aorting helper 

  return {
    totalIncome,
    totalExpense,
    categoryBreakdown,
    trendData
  };
}
