import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Orders with successful payments that need fixing
const ordersToFix = [
  'cmkxu7qnv000cjs04o7cnx6yr',
  'cmkxtzz860002i804zlkfkkz9', 
  'cmkvs1tre0005jo04kig4zqwb',
];

async function fixPendingOrders() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  for (const orderId of ordersToFix) {
    // Get order details
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tier: true, tickets: true },
    });

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      continue;
    }

    if (order.paymentStatus === 'success' && order.tickets.length > 0) {
      continue;
    }

    // Call the verify-payment endpoint
    try {
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

      if (!response.ok || !result.success) {
        console.error(`Verification failed for ${orderId}: ${result.error || 'Unknown error'}`);
        if (result.details) {
          console.error(`Details: ${result.details}`);
        }
      }
    } catch (error) {
      console.error(`Error verifying order ${orderId}:`, error);
    }
  }
  await prisma.$disconnect();
}

fixPendingOrders().catch(console.error);
