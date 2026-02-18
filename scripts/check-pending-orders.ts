import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPendingOrders() {
  console.log('=== Checking Pending Ticket Orders ===\n');

  // Get all pending orders
  const pendingOrders = await prisma.eventTicketOrder.findMany({
    where: { paymentStatus: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: { tier: true, tickets: true },
  });

  console.log(`Found ${pendingOrders.length} orders with pending payment status:\n`);

  for (const order of pendingOrders) {
    console.log(`Order ID: ${order.id}`);
    console.log(`  Order Reference: ${order.orderId}`);
    console.log(`  Payment Reference: ${order.paymentReference}`);
    console.log(`  Payment Status: ${order.paymentStatus}`);
    console.log(`  Order Status: ${order.status}`);
    console.log(`  Amount: ${order.currency} ${order.totalAmount}`);
    console.log(`  Buyer: ${order.buyerName} (${order.buyerEmail})`);
    console.log(`  Created: ${order.createdAt}`);
    console.log(`  Tickets Generated: ${order.tickets.length}`);
    console.log('');
  }

  // Also check if there are orders with payment references but still pending
  const ordersWithRef = pendingOrders.filter(o => o.paymentReference && o.paymentReference !== '');
  console.log(`\n=== Orders with Payment References but Pending Status: ${ordersWithRef.length} ===\n`);
  
  for (const order of ordersWithRef) {
    console.log(`- ${order.orderId}: ${order.paymentReference}`);
  }

  await prisma.$disconnect();
}

checkPendingOrders().catch(console.error);
