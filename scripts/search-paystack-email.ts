import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function searchPaystackByEmail() {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('ERROR: PAYSTACK_SECRET_KEY not configured');
    process.exit(1);
  }

  // Get pending orders
  const pendingOrders = await prisma.eventTicketOrder.findMany({
    where: { paymentStatus: 'pending' },
    orderBy: { createdAt: 'desc' },
  });

  for (const order of pendingOrders) {
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

        void matches;
      }
    } catch (error) {
      console.error('Error searching transactions:', error);
    }
  }
  
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

      void relevant;
    }
  } catch (error) {
    console.error('Error listing recent transactions:', error);
  }

  await prisma.$disconnect();
}

searchPaystackByEmail().catch(console.error);
