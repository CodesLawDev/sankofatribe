import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAndFixPendingOrders() {
  console.log('=== Verifying Pending Orders with Paystack ===\n');

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

  console.log(`Found ${pendingOrders.length} pending orders to verify\n`);

  const successfulPayments: string[] = [];
  const failedPayments: string[] = [];
  const notFoundPayments: string[] = [];

  for (const order of pendingOrders) {
    // The payment reference stored in the order is actually the order.id
    // because in purchase-tickets/route.ts, we use: reference: order.id
    const reference = order.paymentReference || order.id;
    
    console.log(`Checking order ${order.orderId} (ref: ${reference})...`);
    
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
      
      if (verifyData.status && verifyData.data) {
        const paymentStatus = verifyData.data.status;
        console.log(`  Paystack status: ${paymentStatus}`);
        console.log(`  Amount: ${verifyData.data.amount / 100} ${verifyData.data.currency}`);
        console.log(`  Paid at: ${verifyData.data.paid_at}`);
        
        if (paymentStatus === 'success') {
          successfulPayments.push(order.id);
          console.log(`  ✓ Payment was SUCCESSFUL - needs fixing in database`);
        } else if (paymentStatus === 'abandoned') {
          failedPayments.push(order.id);
          console.log(`  ✗ Payment was ABANDONED by user`);
        } else if (paymentStatus === 'failed') {
          failedPayments.push(order.id);
          console.log(`  ✗ Payment FAILED`);
        } else {
          console.log(`  ? Unknown status: ${paymentStatus}`);
        }
      } else {
        console.log(`  ! Transaction not found or error: ${verifyData.message}`);
        notFoundPayments.push(order.id);
      }
    } catch (error) {
      console.log(`  ! Error verifying: ${error}`);
    }
    
    console.log('');
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Successful payments (need fixing): ${successfulPayments.length}`);
  console.log(`Failed/Abandoned payments: ${failedPayments.length}`);
  console.log(`Not found in Paystack: ${notFoundPayments.length}`);

  if (successfulPayments.length > 0) {
    console.log('\n=== ORDERS WITH SUCCESSFUL PAYMENTS NEEDING FIX ===');
    for (const orderId of successfulPayments) {
      console.log(`  - ${orderId}`);
    }
    console.log('\nTo fix these orders, run the verify-payment endpoint for each reference');
  }

  await prisma.$disconnect();
}

verifyAndFixPendingOrders().catch(console.error);
