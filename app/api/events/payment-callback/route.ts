import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';
import { sendSMS } from '@/lib/sms-service';
import QRCode from 'qrcode';
import { verifyHubtelPayment } from '@/lib/hubtel';

const prisma = getPrisma();

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

/**
 * Payment callback handler for ticket payments
 * This route receives the callback from the payment provider,
 * verifies the payment, generates tickets, and redirects to confirmation page
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const provider = (searchParams.get('provider') || 'PAYSTACK').toUpperCase();
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';

  if (!reference) {
    return NextResponse.redirect(`${baseUrl}/events?error=missing_reference`);
  }

  try {
    let order: any = null;
    let attendees: AttendeeInfo[] | null = null;

    if (provider === 'PAYSTACK') {
      // Verify payment with Paystack
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) {
        console.error('PAYSTACK_SECRET_KEY not configured');
        return NextResponse.redirect(`${baseUrl}/events?error=config_error`);
      }

      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyData.status || verifyData.data.status !== 'success') {
        console.error('Payment verification failed:', verifyData);
        return NextResponse.redirect(`${baseUrl}/events?error=payment_failed`);
      }

      // Get metadata
      const metadata = verifyData.data.metadata;
      
      if (!metadata || !metadata.orderId) {
        console.error('Missing orderId in Paystack metadata:', { metadata });
        return NextResponse.redirect(`${baseUrl}/events?error=invalid_metadata`);
      }

      // Get order
      order = await prisma.eventTicketOrder.findUnique({
        where: { id: metadata.orderId },
        include: { tier: true, tickets: true },
      });

      if (!order) {
        console.error('Order not found:', metadata.orderId);
        return NextResponse.redirect(`${baseUrl}/events?error=order_not_found`);
      }

      if (order.attendees && Array.isArray(order.attendees)) {
        // Validate that the attendees array matches the expected structure
        try {
          const parsed = order.attendees as unknown as AttendeeInfo[];
          const isValid = parsed.every(
            (item) =>
              item &&
              typeof item === 'object' &&
              typeof item.name === 'string' &&
              typeof item.email === 'string' &&
              typeof item.phone === 'string'
          );
          if (isValid) {
            attendees = parsed;
          }
        } catch {
          // Invalid attendees data, leave as null
        }
      }

      if (!attendees && metadata.attendees) {
        try {
          attendees = JSON.parse(metadata.attendees);
        } catch (e) {
          console.error('Failed to parse attendees:', e);
          return NextResponse.redirect(`${baseUrl}/events?error=invalid_attendees`);
        }
      }
    } else if (provider === 'HUBTEL') {
      const hubtelResult = await verifyHubtelPayment(reference);
      if (hubtelResult.status !== 'SUCCESS') {
        console.error('Hubtel payment verification failed:', hubtelResult);
        return NextResponse.redirect(`${baseUrl}/events?error=payment_failed`);
      }

      order = await prisma.eventTicketOrder.findUnique({
        where: { id: reference },
        include: { tier: true, tickets: true },
      });

      if (!order) {
        console.error('Order not found:', reference);
        return NextResponse.redirect(`${baseUrl}/events?error=order_not_found`);
      }

      if (order.attendees && Array.isArray(order.attendees)) {
        // Validate that the attendees array matches the expected structure
        try {
          const parsed = order.attendees as unknown as AttendeeInfo[];
          const isValid = parsed.every(
            (item) =>
              item &&
              typeof item === 'object' &&
              typeof item.name === 'string' &&
              typeof item.email === 'string' &&
              typeof item.phone === 'string'
          );
          if (isValid) {
            attendees = parsed;
          }
        } catch {
          // Invalid attendees data, leave as null
        }
      }
    } else {
      return NextResponse.redirect(`${baseUrl}/events?error=invalid_provider`);
    }

    // Get event slug for redirect
    const eventQuery = `*[_type == "event" && _id == $eventId][0] {
      _id,
      title,
      "slug": slug.current,
      eventDate,
      venue,
      "imageUrl": image.asset->url
    }`;
    
    const event = await serverClient.fetch(eventQuery, { eventId: order.eventId });
    
    if (!event) {
      console.error('Event not found:', order.eventId);
      return NextResponse.redirect(`${baseUrl}/events?error=event_not_found`);
    }

    // Check if tickets already generated
    if (order.tickets.length > 0) {
      // Already processed, just redirect
      return NextResponse.redirect(
        `${baseUrl}/events/${event.slug}/ticket-confirmation?reference=${reference}`
      );
    }

    if (!attendees || attendees.length === 0) {
      console.error('Missing attendees for order');
      return NextResponse.redirect(`${baseUrl}/events?error=missing_attendees`);
    }

    // Generate tickets
    const eventAbbrev = event.title
      .split(' ')
      .filter((word: string) => word.length > 2)
      .slice(0, 3)
      .map((word: string) => word[0].toUpperCase())
      .join('');

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

    const ticketDataArray = await Promise.all(
      attendees.map(async (attendee, index) => {
        const ticketNumber = String(nextTicketNumber + index).padStart(3, '0');
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

        return {
          ticketId,
          orderId: order.id,
          eventId: order.eventId,
          tierId: order.tierId,
          attendeeName: attendee.name,
          attendeeEmail: attendee.email,
          attendeePhone: attendee.phone,
          qrCode: qrCodeUrl,
          status: 'AVAILABLE' as const,
        };
      })
    );

    // Create tickets
    const tickets = [];
    for (const ticketData of ticketDataArray) {
      try {
        const ticket = await prisma.eventTicket.create({
          data: ticketData,
        });
        tickets.push(ticket);
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('ticketId')) {
          const existingTicket = await prisma.eventTicket.findUnique({
            where: { ticketId: ticketData.ticketId },
          });
          if (existingTicket) {
            tickets.push(existingTicket);
          }
        } else {
          throw error;
        }
      }
    }

    // Update order
    await prisma.eventTicketOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'success',
        paymentMethod: provider.toLowerCase(),
      },
    });

    // Update sold count
    await prisma.eventTicketTier.update({
      where: { id: order.tierId },
      data: { sold: { increment: order.ticketCount } },
    });

    // Send SMS
    if (order.buyerPhone) {
      try {
        const ticketList = tickets.map((t: any) => t.ticketId).join(', ');
        const downloadLink = `${baseUrl}/api/tickets/${tickets[0].ticketId}?format=image`;
        const smsMessage = `SANKOFA TRIBE\n\n${event.title}\n${new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\nTicket(s): ${ticketList}\n\nDownload: ${downloadLink}`;
        
        await sendSMS(order.buyerPhone, smsMessage);
      } catch (smsError) {
        console.error('SMS send failed:', smsError);
      }
    }

    // Redirect to confirmation page
    return NextResponse.redirect(
      `${baseUrl}/events/${event.slug}/ticket-confirmation?reference=${reference}`
    );

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${baseUrl}/events?error=processing_error`);
  }
}
