import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Orders with successful payments that need fixing
const ordersToFix = [
  'cmkxu7qnv000cjs04o7cnx6yr',
  'cmkxtzz860002i804zlkfkkz9', 
  'cmkvs1tre0005jo04kig4zqwb',
];

async function fixPendingOrders() {
  console.log('=== Fixing Pending Orders with Successful Payments ===\n');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  for (const orderId of ordersToFix) {
    console.log(`\nProcessing order: ${orderId}`);
    
    // Get order details
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tier: true, tickets: true },
    });

    if (!order) {
      console.log(`  Order not found!`);
      continue;
    }

    console.log(`  Buyer: ${order.buyerName} (${order.buyerEmail})`);
    console.log(`  Current status: ${order.paymentStatus}`);
    console.log(`  Tickets already generated: ${order.tickets.length}`);

    if (order.paymentStatus === 'success' && order.tickets.length > 0) {
      console.log(`  Already fixed - skipping`);
      continue;
    }

    // Call the verify-payment endpoint
    try {
      console.log(`  Calling verify-payment API...`);
      
      const response = await fetch(`${baseUrl}/api/events/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: orderId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`  ✅ SUCCESS: ${result.message}`);
        console.log(`  Tickets generated: ${result.tickets?.length || 0}`);
        if (result.tickets) {
          for (const ticket of result.tickets) {
            console.log(`    - ${ticket.ticketId}: ${ticket.attendeeName}`);
          }
        }
      } else {
        console.log(`  ❌ FAILED: ${result.error || 'Unknown error'}`);
        if (result.details) {
          console.log(`  Details: ${result.details}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error}`);
    }
  }

  console.log('\n=== Done ===');
  await prisma.$disconnect();
}

fixPendingOrders().catch(console.error);
