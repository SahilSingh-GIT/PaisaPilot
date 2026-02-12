import { prisma } from '../config/db.js';

export async function getGoals(userId) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createGoal(userId, data) {
  return prisma.goal.create({
    data: {
      ...data,//data spreading used when we want to attach extra feilds
      userId
    }
  });
}

export async function updateGoal(userId, goalId, data) {
  const existing = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!existing || existing.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  // Handle status transitions if necessary based on amount reached
  if (data.currentAmount !== undefined) {
    if (Number(data.currentAmount) >= Number(existing.targetAmount)) {
      data.status = 'COMPLETED';
    } else if (existing.status === 'COMPLETED' && Number(data.currentAmount) < Number(existing.targetAmount)) {
      data.status = 'ACTIVE';
    }
  }

  return prisma.goal.update({
    where: { id: goalId },
    data
  });
}

export async function deleteGoal(userId, goalId) {
  const existing = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!existing || existing.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  return prisma.goal.delete({
    where: { id: goalId }
  });
}
