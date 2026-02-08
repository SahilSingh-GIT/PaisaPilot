import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = 'sahil2004ara@gmail.com';

async function main() {
  console.log(`\n--- PaisaPilot Demo Data Generator ---`);
  console.log(`Targeting demo account: ${DEMO_USER_EMAIL}`);
  console.log(`WARNING: Replacing ONLY demo financial data for this specific account.`);
  
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!user) {
    console.error(`\n[ERROR] Demo user ${DEMO_USER_EMAIL} not found.`);
    console.log(`Please register this account via the UI first if you wish to run the demo seed.`);
    process.exit(1);
  }

  // 1. Idempotent Cleanup (ONLY for this user)
  console.log(`\nCleaning up existing demo data for user...`);
  
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  
  // We keep the user's categories intact, as they might have custom ones. 
  // We will fetch all default categories for them.
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId: user.id }
      ]
    }
  });

  const getCategory = (name) => categories.find(c => c.name === name)?.id;
  
  const foodId = getCategory('Food') || getCategory('Other');
  const transportId = getCategory('Transport') || getCategory('Other');
  const shoppingId = getCategory('Shopping') || getCategory('Other');
  const entertainmentId = getCategory('Entertainment') || getCategory('Other');
  const otherId = getCategory('Other');
  
  // 2. Generate Transactions
  const numTransactions = Math.floor(Math.random() * (70 - 45 + 1) + 45); // 45 to 70
  console.log(`Generating ${numTransactions} transactions spanning 60 days...`);

  const now = new Date();
  const transactionsToInsert = [];

  for (let i = 0; i < numTransactions; i++) {
    // Random date within last 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const txDate = new Date(now);
    txDate.setDate(txDate.getDate() - daysAgo);

    // Determine type (Mostly Expenses, Some Income)
    const isIncome = Math.random() < 0.15; // 15% chance of income
    
    if (isIncome) {
      const incomeTypes = [
        { title: 'Monthly Pocket Money', amt: [3000, 5000] },
        { title: 'Rahul Returned Money', amt: [200, 500] },
        { title: 'Friend Repaid Borrowed Money', amt: [150, 400] },
      ];
      const type = incomeTypes[Math.floor(Math.random() * incomeTypes.length)];
      const amount = Math.floor(Math.random() * (type.amt[1] - type.amt[0]) + type.amt[0]);
      
      transactionsToInsert.push({
        userId: user.id,
        categoryId: getCategory('Pocket Money') || otherId,
        type: 'INCOME',
        amount,
        title: type.title,
        transactionDate: txDate,
        paymentMethod: 'UPI',
        merchant: null
      });
    } else {
      const expenseTypes = [
        { cat: foodId, m: ['Meghana Foods', 'Hostel canteen', 'Cafe', 'Swiggy', 'Zomato'], amt: [80, 500] },
        { cat: transportId, m: ['Uber', 'Ola', 'Rapido', 'Metro', 'Auto'], amt: [50, 250] },
        { cat: shoppingId, m: ['Amazon', 'Flipkart', 'H&M', 'College supplies'], amt: [300, 1500] },
        { cat: entertainmentId, m: ['Movie', 'OTT Subscription', 'Gaming', 'Cafe outing'], amt: [150, 600] },
        { cat: otherId, m: ['Stationery', 'Mobile recharge', 'Pharmacy'], amt: [50, 300] }
      ];
      
      // Weight towards food and transport
      const roll = Math.random();
      let type;
      if (roll < 0.4) type = expenseTypes[0]; // 40% Food
      else if (roll < 0.65) type = expenseTypes[1]; // 25% Transport
      else if (roll < 0.8) type = expenseTypes[2]; // 15% Shopping
      else if (roll < 0.9) type = expenseTypes[3]; // 10% Ent
      else type = expenseTypes[4]; // 10% Other

      const amount = Math.floor(Math.random() * (type.amt[1] - type.amt[0]) + type.amt[0]);
      const merchant = type.m[Math.floor(Math.random() * type.m.length)];

      transactionsToInsert.push({
        userId: user.id,
        categoryId: type.cat,
        type: 'EXPENSE',
        amount,
        title: `Expense at ${merchant}`,
        transactionDate: txDate,
        paymentMethod: Math.random() > 0.3 ? 'UPI' : 'CASH', // Mostly UPI
        merchant
      });
    }
  }

  // Ensure they have at least one large pocket money entry recently
  transactionsToInsert.push({
    userId: user.id,
    categoryId: getCategory('Pocket Money') || otherId,
    type: 'INCOME',
    amount: 5000,
    title: 'Monthly Pocket Money',
    transactionDate: new Date(),
    paymentMethod: 'BANK_TRANSFER',
    merchant: null
  });

  await prisma.transaction.createMany({ data: transactionsToInsert });

  // 3. Generate Budgets
  console.log(`Generating budgets...`);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const budgetsToInsert = [
    {
      userId: user.id,
      categoryId: foodId,
      amount: 4000, // Likely to be moderate utilization
      period: 'MONTHLY',
      startDate: startOfMonth,
      endDate: endOfMonth
    },
    {
      userId: user.id,
      categoryId: shoppingId,
      amount: 1000, // Likely to be approaching limit or exceeded
      period: 'MONTHLY',
      startDate: startOfMonth,
      endDate: endOfMonth
    },
    {
      userId: user.id,
      categoryId: transportId,
      amount: 2000, // Likely healthy
      period: 'MONTHLY',
      startDate: startOfMonth,
      endDate: endOfMonth
    }
  ];

  await prisma.budget.createMany({ data: budgetsToInsert });

  // 4. Generate Goals
  console.log(`Generating goals...`);
  
  const targetDate1 = new Date(now); targetDate1.setMonth(targetDate1.getMonth() + 3);
  const targetDate2 = new Date(now); targetDate2.setMonth(targetDate2.getMonth() + 6);
  const targetDate3 = new Date(now); targetDate3.setMonth(targetDate3.getMonth() + 1);

  const goalsToInsert = [
    {
      userId: user.id,
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 4500, // Moderate progress
      targetDate: targetDate1,
      status: 'ACTIVE'
    },
    {
      userId: user.id,
      name: 'New Laptop Fund',
      targetAmount: 50000,
      currentAmount: 5000, // Low progress
      targetDate: targetDate2,
      status: 'ACTIVE'
    },
    {
      userId: user.id,
      name: 'Goa Trip',
      targetAmount: 8000,
      currentAmount: 7200, // Very close
      targetDate: targetDate3,
      status: 'ACTIVE'
    }
  ];

  await prisma.goal.createMany({ data: goalsToInsert });

  console.log(`\n✅ Demo data generation complete!`);
  console.log(`- Inserted ${transactionsToInsert.length} transactions`);
  console.log(`- Created 3 budgets`);
  console.log(`- Created 3 goals\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
