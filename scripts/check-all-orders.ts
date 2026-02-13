import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllOrders() {
  // Get all orders (successful and pending)
  const allOrders = await prisma.eventTicketOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tier: true, tickets: true },
  });

  void allOrders;

  await prisma.$disconnect();
}

checkAllOrders().catch(console.error);
