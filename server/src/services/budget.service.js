import { prisma } from '../config/db.js';

export async function getBudgets(userId) {
  return prisma.budget.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBudget(userId, data) {
  // Validate category
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category || (!category.isDefault && category.userId !== userId)) {
    throw new Error('INVALID_CATEGORY');
  }

  // Basic check to avoid identical budget for same category/period/start date
  const existing = await prisma.budget.findFirst({
    where: {
      userId,
      categoryId: data.categoryId,
      period: data.period,
      startDate: data.startDate
    }
  });

  if (existing) {
    throw new Error('BUDGET_EXISTS');
  }

  return prisma.budget.create({
    data: {
      ...data,
      userId
    },
    include: { category: true }
  });
}

export async function updateBudget(userId, budgetId, data) {
  const existing = await prisma.budget.findUnique({ where: { id: budgetId } });
  if (!existing || existing.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category || (!category.isDefault && category.userId !== userId)) {
      throw new Error('INVALID_CATEGORY');
    }
  }

  return prisma.budget.update({
    where: { id: budgetId },
    data,//shorthand data:data
    include: { category: true }
  });
}

export async function deleteBudget(userId, budgetId) {
  const existing = await prisma.budget.findUnique({ where: { id: budgetId } });
  if (!existing || existing.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  return prisma.budget.delete({
    where: { id: budgetId }
  });
}
