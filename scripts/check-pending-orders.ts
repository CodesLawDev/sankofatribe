import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPendingOrders() {
  // Get all pending orders
  const pendingOrders = await prisma.eventTicketOrder.findMany({
    where: { paymentStatus: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: { tier: true, tickets: true },
  });

  void pendingOrders;

  // Also check if there are orders with payment references but still pending
  void pendingOrders;

  await prisma.$disconnect();
}

checkPendingOrders().catch(console.error);
