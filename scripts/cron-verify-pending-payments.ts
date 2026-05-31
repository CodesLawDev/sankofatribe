/**
 * Cron job script to verify pending payments
 * This script checks all pending ticket orders against Paystack
 * and generates tickets for any successful payments that weren't processed
 * 
 * Run via: npx tsx scripts/cron-verify-pending-payments.ts
 * Or via GitHub Actions workflow
 */

import { PrismaClient, TicketStatus } from '@prisma/client';
import QRCode from 'qrcode';
import { createClient } from '@sanity/client';

const prisma = new PrismaClient();

// Initialize Sanity client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

interface VerificationResult {
  orderId: string;
  buyerEmail: string;
  status: 'fixed' | 'failed' | 'abandoned' | 'already_processed' | 'not_found';
  message: string;
  ticketsGenerated?: number;
}

async function sendSMS(phone: string, message: string): Promise<boolean> {
  const apiKey = process.env.FLASHSMS_API_KEY;
  const senderId = process.env.FLASHSMS_SENDER_ID || 'SankofaTrib';

  if (!apiKey) {
    console.log('  SMS: FlashSMS API key not configured, skipping');
    return false;
  }

  try {
    const response = await fetch('https://app.flashsms.africa/api/v1/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderId,
        message,
        recipients: [phone.replace(/\s/g, '')],
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('  SMS send error:', error);
    return false;
  }
}

async function verifyAndFixOrder(orderId: string): Promise<VerificationResult> {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    return {
      orderId,
      buyerEmail: '',
      status: 'failed',
      message: 'Paystack secret key not configured',
    };
  }

  // Get order
  const order = await prisma.eventTicketOrder.findUnique({
    where: { id: orderId },
    include: { tier: true, tickets: true },
  });

  if (!order) {
    return {
      orderId,
      buyerEmail: '',
      status: 'not_found',
      message: 'Order not found in database',
    };
  }

  // Already processed?
  if (order.paymentStatus === 'success' && order.tickets.length > 0) {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'already_processed',
      message: 'Order already has tickets generated',
      ticketsGenerated: order.tickets.length,
    };
  }

  // Verify with Paystack
  const verifyResponse = await fetch(
    `https://api.paystack.co/transaction/verify/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    }
  );

  const verifyData = await verifyResponse.json();

  if (!verifyData.status) {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'not_found',
      message: 'Transaction not found in Paystack',
    };
  }

  const paystackStatus = verifyData.data.status;

  if (paystackStatus === 'abandoned' || paystackStatus === 'failed') {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'abandoned',
      message: `Payment was ${paystackStatus}`,
    };
  }

  if (paystackStatus !== 'success') {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'failed',
      message: `Unknown payment status: ${paystackStatus}`,
    };
  }

  // Payment is successful - generate tickets
  const metadata = verifyData.data.metadata;

  if (!metadata?.attendees) {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'failed',
      message: 'Missing attendees in payment metadata',
    };
  }

  let attendees: AttendeeInfo[];
  try {
    attendees = JSON.parse(metadata.attendees);
  } catch (e) {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'failed',
      message: 'Failed to parse attendees',
    };
  }

  // Fetch event from Sanity
  const eventQuery = `*[_type == "event" && _id == $eventId][0] {
    _id,
    title,
    eventDate,
    venue
  }`;

  let event;
  try {
    event = await sanityClient.fetch(eventQuery, { eventId: order.eventId });
  } catch (e) {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'failed',
      message: 'Failed to fetch event from Sanity',
    };
  }

  if (!event) {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'failed',
      message: 'Event not found in Sanity',
    };
  }

  // Generate event abbreviation
  const eventAbbrev = event.title
    .split(' ')
    .filter((word: string) => word.length > 2)
    .slice(0, 3)
    .map((word: string) => word[0].toUpperCase())
    .join('');

  // Get highest ticket number
  const lastTicket = await prisma.eventTicket.findFirst({
    where: { eventId: order.eventId },
    orderBy: { ticketId: 'desc' },
    take: 1,
  });

  let nextTicketNumber = 1;
  if (lastTicket && lastTicket.ticketId) {
    const match = lastTicket.ticketId.match(/(\d+)$/);
    if (match) {
      nextTicketNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Generate tickets
  const ticketsToCreate = [];
  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];
    const ticketNumber = String(nextTicketNumber + i).padStart(3, '0');
    const ticketId = `${eventAbbrev}-${ticketNumber}`;

    const qrCodeData = JSON.stringify({
      ticketId,
      eventId: order.eventId,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
    });

    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    });

    ticketsToCreate.push({
      ticketId,
      orderId: order.id,
      eventId: order.eventId,
      tierId: order.tierId,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      attendeePhone: attendee.phone,
      qrCode: qrCodeUrl,
      status: 'AVAILABLE' as TicketStatus,
    });
  }

  // Create tickets
  try {
    await prisma.eventTicket.createMany({
      data: ticketsToCreate,
      skipDuplicates: true,
    });
  } catch (e: any) {
    return {
      orderId,
      buyerEmail: order.buyerEmail,
      status: 'failed',
      message: `Failed to create tickets: ${e.message}`,
    };
  }

  // Update order status
  await prisma.eventTicketOrder.update({
    where: { id: order.id },
    data: { paymentStatus: 'success' },
  });

  // Update tier sold count
  await prisma.eventTicketTier.update({
    where: { id: order.tierId },
    data: { sold: { increment: order.ticketCount } },
  });

  // Send SMS notification
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';
  if (order.buyerPhone) {
    const ticketList = ticketsToCreate.map(t => t.ticketId).join(', ');
    const downloadLink = `${baseUrl}/api/tickets/${ticketsToCreate[0].ticketId}?format=image`;
    const smsMessage = `SANKOFA TRIBE\n\n${event.title}\n${new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\nTicket(s): ${ticketList}\n\nDownload: ${downloadLink}`;
    
    await sendSMS(order.buyerPhone, smsMessage);
  }

  return {
    orderId,
    buyerEmail: order.buyerEmail,
    status: 'fixed',
    message: `Successfully generated ${ticketsToCreate.length} ticket(s)`,
    ticketsGenerated: ticketsToCreate.length,
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('PENDING PAYMENT VERIFICATION JOB');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // Get all pending orders
  const pendingOrders = await prisma.eventTicketOrder.findMany({
    where: { paymentStatus: 'pending' },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\nFound ${pendingOrders.length} pending order(s) to check\n`);

  if (pendingOrders.length === 0) {
    console.log('No pending orders to process.');
    await prisma.$disconnect();
    return;
  }

  const results: VerificationResult[] = [];

  for (const order of pendingOrders) {
    console.log(`\nProcessing: ${order.id}`);
    console.log(`  Buyer: ${order.buyerName} (${order.buyerEmail})`);
    console.log(`  Amount: ${order.currency} ${order.totalAmount}`);
    console.log(`  Created: ${order.createdAt.toISOString()}`);

    const result = await verifyAndFixOrder(order.id);
    results.push(result);

    console.log(`  Result: ${result.status} - ${result.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const fixed = results.filter(r => r.status === 'fixed');
  const abandoned = results.filter(r => r.status === 'abandoned');
  const failed = results.filter(r => r.status === 'failed');
  const notFound = results.filter(r => r.status === 'not_found');
  const alreadyProcessed = results.filter(r => r.status === 'already_processed');

  console.log(`\n✅ Fixed: ${fixed.length}`);
  for (const r of fixed) {
    console.log(`   - ${r.buyerEmail}: ${r.ticketsGenerated} ticket(s)`);
  }

  console.log(`\n⏳ Abandoned: ${abandoned.length}`);
  for (const r of abandoned) {
    console.log(`   - ${r.buyerEmail}`);
  }

  console.log(`\n❌ Failed: ${failed.length}`);
  for (const r of failed) {
    console.log(`   - ${r.buyerEmail}: ${r.message}`);
  }

  console.log(`\n❓ Not Found: ${notFound.length}`);
  console.log(`\n✓ Already Processed: ${alreadyProcessed.length}`);

  console.log(`\nCompleted at: ${new Date().toISOString()}`);

  await prisma.$disconnect();

  // Exit with error code if any critical failures
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
