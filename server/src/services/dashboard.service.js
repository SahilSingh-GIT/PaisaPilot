import { prisma } from '../config/db.js';

export async function getDashboardSummary(userId) {
  const now = new Date(); //new Date(year, month, day/date/time)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  // 1. Fetch transactions for the current month
  const currentMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Calculate totals
  let income = 0;
  let expenses = 0;

  currentMonthTransactions.forEach((t) => {
    const amt = Number(t.amount);
    if (t.type === "INCOME") income += amt;
    else if (t.type === "EXPENSE") expenses += amt;
  });

  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // 2. Recent transactions (latest 5)
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { transactionDate: "desc" },
    take: 5,
  });

  // 3. Active budgets progress
  const activeBudgets = await prisma.budget.findMany({
    where: {
      userId,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    include: { category: true },
    take: 5,
  });

  const budgetProgress = await Promise.all(
    activeBudgets.map(async (budget) => {
      // Determine the period bounds for this budget instance (assuming current month if monthly for simple calculation)
      let bStart = budget.startDate;
      let bEnd = budget.endDate || endOfMonth;

      if (budget.period === "MONTHLY") {
        bStart = startOfMonth;
        bEnd = endOfMonth;
      }

      const categorySpending = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          transactionDate: {
            gte: bStart,
            lte: bEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const spent = Number(categorySpending._sum.amount || 0);
      const limit = Number(budget.amount);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      return {
        id: budget.id,
        categoryName: budget.category.name,
        color: budget.category.color,
        spent,
        limit,
        percentage: Math.min(percentage, 100), // Cap visually at 100% for progress bars, though UI can show overage
        isExceeded: spent > limit,
      };
    }),
  );

  return {
    income,
    expenses,
    balance,
    savingsRate,
    recentTransactions,
    budgetProgress,
  };
}
