import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllOrders() {
  console.log('=== Checking All Ticket Orders ===\n');

  // Get all orders (successful and pending)
  const allOrders = await prisma.eventTicketOrder.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tier: true, tickets: true },
  });

  console.log(`Total orders in database: ${allOrders.length}\n`);

  // Group by payment status
  const byStatus: Record<string, typeof allOrders> = {};
  for (const order of allOrders) {
    const status = order.paymentStatus || 'unknown';
    if (!byStatus[status]) byStatus[status] = [];
    byStatus[status].push(order);
  }

  console.log('Orders by payment status:');
  for (const [status, orders] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${orders.length}`);
  }

  // Show successful orders for comparison
  const successOrders = byStatus['success'] || [];
  if (successOrders.length > 0) {
    console.log('\n=== Recent Successful Orders (for reference comparison) ===');
    for (const order of successOrders.slice(0, 5)) {
      console.log(`\nOrder ID: ${order.id}`);
      console.log(`  Order Reference: ${order.orderId}`);
      console.log(`  Payment Reference: ${order.paymentReference}`);
      console.log(`  Payment Status: ${order.paymentStatus}`);
      console.log(`  Tickets Generated: ${order.tickets.length}`);
      console.log(`  Created: ${order.createdAt}`);
    }
  }

  // Show pending orders
  const pendingOrders = byStatus['pending'] || [];
  if (pendingOrders.length > 0) {
    console.log('\n=== Pending Orders ===');
    for (const order of pendingOrders) {
      console.log(`\nOrder ID: ${order.id}`);
      console.log(`  Order Reference: ${order.orderId}`);
      console.log(`  Payment Reference: ${order.paymentReference}`);
      console.log(`  Payment Status: ${order.paymentStatus}`);
      console.log(`  Tickets Generated: ${order.tickets.length}`);
      console.log(`  Buyer: ${order.buyerName} (${order.buyerEmail})`);
      console.log(`  Phone: ${order.buyerPhone}`);
      console.log(`  Amount: ${order.currency} ${order.totalAmount}`);
      console.log(`  Created: ${order.createdAt}`);
    }
  }

  await prisma.$disconnect();
}

checkAllOrders().catch(console.error);
