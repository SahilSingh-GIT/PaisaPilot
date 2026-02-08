import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  // Expense Categories
  {
    name: 'Food',
    type: CategoryType.EXPENSE,
    icon: 'utensils',
    color: '#F59E0B',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Transport',
    type: CategoryType.EXPENSE,
    icon: 'car',
    color: '#3B82F6',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Shopping',
    type: CategoryType.EXPENSE,
    icon: 'shopping-bag',
    color: '#EC4899',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Entertainment',
    type: CategoryType.EXPENSE,
    icon: 'film',
    color: '#8B5CF6',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Bills & Utilities',
    type: CategoryType.EXPENSE,
    icon: 'zap',
    color: '#10B981',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Health',
    type: CategoryType.EXPENSE,
    icon: 'heart-pulse',
    color: '#EF4444',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Education',
    type: CategoryType.EXPENSE,
    icon: 'graduation-cap',
    color: '#6366F1',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Travel',
    type: CategoryType.EXPENSE,
    icon: 'plane',
    color: '#06B6D4',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Other',
    type: CategoryType.EXPENSE,
    icon: 'more-horizontal',
    color: '#6B7280',
    isDefault: true,
    userId: null,
  },

  // Income Categories
  {
    name: 'Salary',
    type: CategoryType.INCOME,
    icon: 'briefcase',
    color: '#10B981',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Freelance',
    type: CategoryType.INCOME,
    icon: 'laptop',
    color: '#3B82F6',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Business',
    type: CategoryType.INCOME,
    icon: 'trending-up',
    color: '#8B5CF6',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Investment',
    type: CategoryType.INCOME,
    icon: 'bar-chart-2',
    color: '#F59E0B',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Gift',
    type: CategoryType.INCOME,
    icon: 'gift',
    color: '#EC4899',
    isDefault: true,
    userId: null,
  },
  {
    name: 'Other Income',
    type: CategoryType.INCOME,
    icon: 'plus-circle',
    color: '#6B7280',
    isDefault: true,
    userId: null,
  },
];

async function main() {
  console.log('🌱 Seeding default system categories into PaisaPilot database...');

  let createdCount = 0;
  let skippedCount = 0;

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        name: cat.name,
        type: cat.type,
        isDefault: true,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: cat,
      });
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(
    `✅ Seeding complete: ${createdCount} categories created, ${skippedCount} already existed (idempotent).`
  );
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
