import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPaystackTransactions() {
  console.log('=== Listing Recent Paystack Transactions ===\n');

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('ERROR: PAYSTACK_SECRET_KEY not configured');
    process.exit(1);
  }

  try {
    // List recent transactions from Paystack
    const response = await fetch(
      'https://api.paystack.co/transaction?perPage=50&status=success',
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const data = await response.json();
    
    if (!data.status) {
      console.error('Failed to fetch transactions:', data.message);
      return;
    }

    console.log(`Found ${data.data.length} successful transactions\n`);

    // Get pending orders to compare
    const pendingOrders = await prisma.eventTicketOrder.findMany({
      where: { paymentStatus: 'pending' },
    });

    const pendingEmails = pendingOrders.map(o => o.buyerEmail.toLowerCase());
    const pendingOrderIds = pendingOrders.map(o => o.id);

    console.log('Pending order emails:', pendingEmails);
    console.log('Pending order IDs:', pendingOrderIds);
    console.log('\n=== Paystack Transactions ===\n');

    for (const txn of data.data) {
      const email = txn.customer?.email?.toLowerCase() || '';
      const reference = txn.reference;
      const metadata = txn.metadata || {};
      
      // Check if this matches any pending order
      const matchesEmail = pendingEmails.includes(email);
      const matchesOrderId = pendingOrderIds.includes(reference) || 
                             pendingOrderIds.includes(metadata.orderId);
      
      if (matchesEmail || matchesOrderId) {
        console.log('*** POTENTIAL MATCH ***');
      }
      
      console.log(`Reference: ${reference}`);
      console.log(`  Email: ${email}`);
      console.log(`  Amount: ${txn.amount / 100} ${txn.currency}`);
      console.log(`  Status: ${txn.status}`);
      console.log(`  Paid At: ${txn.paid_at}`);
      console.log(`  Metadata orderId: ${metadata.orderId || 'N/A'}`);
      console.log(`  Metadata eventId: ${metadata.eventId || 'N/A'}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  }

  await prisma.$disconnect();
}

listPaystackTransactions().catch(console.error);
