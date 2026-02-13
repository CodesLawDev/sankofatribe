import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAndFixPendingOrders() {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('ERROR: PAYSTACK_SECRET_KEY not configured');
    process.exit(1);
  }

  // Get all pending orders
  const pendingOrders = await prisma.eventTicketOrder.findMany({
    where: { paymentStatus: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: { tier: true, tickets: true },
  });

  for (const order of pendingOrders) {
    // The payment reference stored in the order is actually the order.id
    // because in purchase-tickets/route.ts, we use: reference: order.id
    const reference = order.paymentReference || order.id;
    
    try {
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.status || !verifyData.data) {
        console.error(`Transaction not found or error: ${verifyData.message}`);
      }
    } catch (error) {
      console.error('Error verifying pending order:', error);
    }
  }

  await prisma.$disconnect();
}

verifyAndFixPendingOrders().catch(console.error);
