import { prisma } from '../config/db.js';

export async function getTransactions(userId, queryParams) {
  const { page = 1, limit = 50, type, categoryId, search, startDate, endDate, sortBy = 'transactionDate', order = 'desc' } = queryParams;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where = { userId };
  // const filters = { userId };

  // prisma.transaction.findMany({
  //   where: filters,
  // }); where is the reserved keyword for prisma to understand
  // jab obj name and KW same rahe then shorthand use kr sakte hai sirf name likho wo obj apne aap bana lega 
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  
  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) where.transactionDate.gte = new Date(startDate);
    if (endDate) where.transactionDate.lte = new Date(endDate);
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { merchant: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { [sortBy]: order },
      skip,
      take: Number(limit)
    }),
    prisma.transaction.count({ where })
  ]);

  return { transactions, total, page: Number(page), limit: Number(limit) };
}

export async function getTransactionById(userId, transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { category: true }
  });
  
  if (!transaction || transaction.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }
  
  return transaction;
}

export async function createTransaction(userId, data) {
  // We can validate if category belongs to user or is default
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category || (!category.isDefault && category.userId !== userId)) {
    throw new Error('INVALID_CATEGORY');
  }

  return prisma.transaction.create({
    data: {
      ...data,
      userId
    },
    include: { category: true }
  });
}

export async function updateTransaction(userId, transactionId, data) {
  const existing = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!existing || existing.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category || (!category.isDefault && category.userId !== userId)) {
      throw new Error('INVALID_CATEGORY');
    }
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data,
    include: { category: true }
  });
}

export async function deleteTransaction(userId, transactionId) {
  const existing = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!existing || existing.userId !== userId) {
    throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
  }

  return prisma.transaction.delete({
    where: { id: transactionId }
  });
}
