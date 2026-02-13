import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';
import { sendSMS } from '@/lib/sms-service';
import QRCode from 'qrcode';

const prisma = getPrisma();

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get metadata first (contains orderId)
    const metadata = verifyData.data.metadata;
    
    if (!metadata || !metadata.orderId) {
      console.error('Missing orderId in Paystack metadata:', { metadata });
      return NextResponse.json(
        { error: 'Invalid payment metadata - missing order ID' },
        { status: 400 }
      );
    }

    // Get order by orderId (from metadata)
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: metadata.orderId },
      include: { tier: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch event details from Sanity
    const eventQuery = `*[_type == "event" && _id == $eventId][0] {
      _id,
      title,
      slug,
      eventDate,
      endDate,
      venue,
      address,
      city,
      "imageUrl": image.asset->url
    }`;
    
    let event;
    try {
      event = await serverClient.fetch(eventQuery, { eventId: order.eventId });
    } catch (sanityError) {
      console.error('Sanity fetch error:', {
        eventId: order.eventId,
        error: sanityError,
      });
      return NextResponse.json(
        { error: 'Failed to fetch event details' },
        { status: 500 }
      );
    }
    
    if (!event) {
      console.error('Event not found in Sanity:', { eventId: order.eventId });
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if tickets already generated
    const existingTickets = await prisma.eventTicket.findMany({
      where: { orderId: order.id },
    });

    if (existingTickets.length > 0) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        tickets: existingTickets,
        message: 'Tickets already generated',
      });
    }

    // Parse attendees from metadata
    if (!metadata.attendees) {
      console.error('Missing attendees in Paystack metadata:', { metadata });
      return NextResponse.json(
        { error: 'Invalid payment metadata - missing attendees' },
        { status: 400 }
      );
    }

    let attendees: AttendeeInfo[];
    try {
      attendees = JSON.parse(metadata.attendees);
    } catch (parseError) {
      console.error('Failed to parse attendees:', {
        attendeesString: metadata.attendees,
        error: parseError,
      });
      return NextResponse.json(
        { error: 'Failed to parse attendee information' },
        { status: 400 }
      );
    }

    // Generate tickets with unique IDs and QR codes
    const eventAbbrev = event.title
      .split(' ')
      .filter((word: string) => word.length > 2)
      .slice(0, 3)
      .map((word: string) => word[0].toUpperCase())
      .join('');
    
    // Get the highest ticket number already used for this event to avoid duplicates
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
    
    // Build ticket data
    const ticketDataArray = await Promise.all(
      attendees.map(async (attendee, index) => {
        const ticketNumber = String(nextTicketNumber + index).padStart(3, '0');
        const ticketId = `${eventAbbrev}-${ticketNumber}`;
        
        // Generate QR code data URL containing ticket ID for scanning
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

    // Try to create tickets, handling duplicates gracefully
    const tickets = [];
    for (const ticketData of ticketDataArray) {
      try {
        const ticket = await prisma.eventTicket.create({
          data: ticketData,
        });
        tickets.push(ticket);
      } catch (error: any) {
        // If ticket already exists (duplicate key), fetch it instead
        if (error.code === 'P2002' && error.meta?.target?.includes('ticketId')) {
          const existingTicket = await prisma.eventTicket.findUnique({
            where: { ticketId: ticketData.ticketId },
          });
          if (existingTicket) {
            tickets.push(existingTicket);
          } else {
            console.error('Could not find existing ticket after duplicate error:', { ticketId: ticketData.ticketId });
            throw error;
          }
        } else {
          console.error('Unexpected error creating ticket:', { error: error.code, target: error.meta?.target });
          throw error;
        }
      }
    }

    // Update order payment status
    await prisma.eventTicketOrder.update({
      where: { id: order.id },
      data: { paymentStatus: 'success' },
    });

    // Update sold count
    await prisma.eventTicketTier.update({
      where: { id: order.tierId },
      data: { sold: { increment: order.ticketCount } },
    });

    // Send SMS confirmation to buyer using existing SMS service
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';
    
    if (order.buyerPhone) {
      try {
        const ticketList = tickets.map((t: any) => t.ticketId).join(', ');
        const downloadLink = `${baseUrl}/api/tickets/${tickets[0].ticketId}?format=image`;
        const smsMessage = `SANKOFA TRIBE\n\n${event.title}\n${new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\nTicket(s): ${ticketList}\n\nDownload: ${downloadLink}`;
        
        await sendSMS(order.buyerPhone, smsMessage);
      } catch (smsError) {
        console.error('SMS send failed:', smsError);
        // Don't fail the whole request if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      event: {
        title: event.title,
        date: event.eventDate,
        venue: event.venue,
        imageUrl: event.imageUrl,
      },
      tickets: tickets.map((t: any) => ({
        ticketId: t.ticketId,
        attendeeName: t.attendeeName,
        attendeeEmail: t.attendeeEmail,
        downloadUrl: `${baseUrl}/api/tickets/${t.ticketId}?format=image`,
        qrCode: t.qrCode,
      })),
      message: 'Tickets generated successfully. SMS sent to buyer.',
    });
  } catch (error) {
    console.error('Payment verification error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    });
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
