import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPaystackTransactions() {
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

    void data;

  } catch (error) {
    console.error('Error:', error);
  }

  await prisma.$disconnect();
}

listPaystackTransactions().catch(console.error);
