import { prisma } from '../config/db.js';

export async function getCategoriesForUser(userId) {
  // Get both system default categories (userId: null) and user's custom categories
  return prisma.category.findMany({
    where: {
      OR: [
        { isDefault: true, userId: null },
        { userId: userId }
      ]
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ]
  });
}

export async function createCustomCategory(userId, data) {
  return prisma.category.create({
    data: {
      ...data,
      userId,
      isDefault: false
    }
  });
}

export async function updateCustomCategory(userId, categoryId, data) {
  // Only update if it belongs to user
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  return prisma.category.update({
    where: { id: categoryId },
    data
  });
}

export async function deleteCustomCategory(userId, categoryId) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  // Check if in use
  const txCount = await prisma.transaction.count({ where: { categoryId } });
  const bgCount = await prisma.budget.count({ where: { categoryId } });

  if (txCount > 0 || bgCount > 0) {
    throw new Error('CATEGORY_IN_USE');
  }

  return prisma.category.delete({
    where: { id: categoryId }
  });
}
