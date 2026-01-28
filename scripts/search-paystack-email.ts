import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function searchPaystackByEmail() {
  console.log('=== Searching Paystack by Email ===\n');

  const paystackSecretKey = process.env.CODETICKETS_PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('ERROR: CODETICKETS_PAYSTACK_SECRET_KEY not configured');
    process.exit(1);
  }

  // Get pending orders
  const pendingOrders = await prisma.eventTicketOrder.findMany({
    where: { paymentStatus: 'pending' },
    orderBy: { createdAt: 'desc' },
  });

  for (const order of pendingOrders) {
    console.log(`\n=== Checking Order ${order.orderId} ===`);
    console.log(`  Buyer: ${order.buyerName} (${order.buyerEmail})`);
    console.log(`  Amount: ${order.currency} ${order.totalAmount}`);
    console.log(`  Created: ${order.createdAt}`);
    console.log(`  Order ID (reference used): ${order.id}`);

    // Search by email - check all transactions
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction?perPage=100`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.status) {
        // Find transactions matching this email
        const matches = data.data.filter((txn: any) => 
          txn.customer?.email?.toLowerCase() === order.buyerEmail.toLowerCase()
        );

        if (matches.length > 0) {
          console.log(`  Found ${matches.length} transaction(s) for this email:`);
          for (const txn of matches) {
            console.log(`    - Reference: ${txn.reference}`);
            console.log(`      Status: ${txn.status}`);
            console.log(`      Amount: ${txn.amount / 100} ${txn.currency}`);
            console.log(`      Paid At: ${txn.paid_at || 'Not paid'}`);
            console.log(`      Metadata orderId: ${txn.metadata?.orderId || 'N/A'}`);
            
            // Check if this matches our order
            if (txn.metadata?.orderId === order.id || txn.reference === order.id) {
              console.log(`      *** MATCHES THIS ORDER ***`);
              if (txn.status === 'success') {
                console.log(`      >>> PAYMENT WAS SUCCESSFUL - NEEDS FIX <<<`);
              }
            }
          }
        } else {
          console.log(`  No transactions found for ${order.buyerEmail}`);
        }
      }
    } catch (error) {
      console.log(`  Error searching: ${error}`);
    }
  }

  // Also list all recent transactions including abandoned/failed
  console.log('\n\n=== All Recent Transactions (Including Failed) ===\n');
  
  try {
    const response = await fetch(
      'https://api.paystack.co/transaction?perPage=100',
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.status) {
      // Get pending order emails
      const pendingEmails = pendingOrders.map(o => o.buyerEmail.toLowerCase());
      
      // Filter to show only matching emails or recent ones
      const relevant = data.data.filter((txn: any) => {
        const email = txn.customer?.email?.toLowerCase() || '';
        return pendingEmails.includes(email);
      });

      if (relevant.length > 0) {
        console.log(`Found ${relevant.length} transactions from pending order emails:`);
        for (const txn of relevant) {
          console.log(`\nReference: ${txn.reference}`);
          console.log(`  Email: ${txn.customer?.email}`);
          console.log(`  Status: ${txn.status}`);
          console.log(`  Amount: ${txn.amount / 100} ${txn.currency}`);
          console.log(`  Created At: ${txn.created_at}`);
          console.log(`  Paid At: ${txn.paid_at || 'Not paid'}`);
          console.log(`  Metadata: ${JSON.stringify(txn.metadata || {})}`);
        }
      } else {
        console.log('No transactions found from the pending order email addresses.');
        console.log('This means these customers never completed the payment process.');
      }
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  }

  await prisma.$disconnect();
}

searchPaystackByEmail().catch(console.error);
