import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';

const prisma = getPrisma();

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params;

    // Find the ticket with event details
    const ticket = await prisma.eventTicket.findUnique({
      where: { ticketId },
      include: {
        order: {
          include: {
            tier: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check payment status
    if (ticket.order.paymentStatus !== 'success') {
      return NextResponse.json(
        { error: 'Payment not completed for this ticket' },
        { status: 400 }
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
    const event = await serverClient.fetch(eventQuery, { eventId: ticket.eventId });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventDateObj = new Date(event.eventDate);
    const eventDateStr = eventDateObj.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const eventTimeStr = eventDateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Generate ticket image using HTML/Canvas
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #f0f0f0;
      padding: 20px;
    }
    .ticket {
      width: 700px;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .event-banner {
      width: 100%;
      height: 300px;
      object-fit: cover;
      display: block;
    }
    .ticket-header {
      background: #fff;
      padding: 22px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eceff4;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      color: #f97316;
      letter-spacing: 0.2px;
    }
    .brand-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #f97316;
    }
    .date-time {
      text-align: right;
      color: #1f2937;
      font-weight: 700;
      font-size: 18px;
      line-height: 1.1;
    }
    .date-time .time {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      letter-spacing: 0.3px;
    }
    .event-title {
      color: #111827;
      font-size: 24px;
      font-weight: 800;
      line-height: 1.25;
      margin: 20px 28px 6px 28px;
      text-align: left;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 0 28px 10px 28px;
      gap: 12px;
    }
    .meta-block {
      font-size: 12px;
      color: #6b7280;
      letter-spacing: 0.5px;
    }
    .meta-block .label {
      display: block;
      margin-bottom: 2px;
    }
    .meta-block .value {
      color: #111827;
      font-size: 14px;
      font-weight: 600;
    }
    .tier {
      color: #111827;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .event-details {
      padding: 0 28px 16px 28px;
      color: #2d3748;
      border-bottom: 1px solid #e5e7eb;
    }
    .event-details .venue {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.6;
    }
    .ticket-body {
      padding: 30px;
      background: white;
    }
    .attendee-info {
      margin-bottom: 24px;
      text-align: center;
    }
    .attendee-info h2 {
      color: #1a202c;
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .attendee-info p {
      color: #4a5568;
      font-size: 14px;
      margin: 4px 0;
    }
    .qr-section {
      text-align: center;
      padding: 24px;
      background: #f7fafc;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .qr-section img {
      width: 320px;
      height: 320px;
      margin: 0 auto;
      border: 4px solid white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .ticket-id {
      text-align: center;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      color: #2d3748;
      font-weight: 700;
      margin-top: 16px;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <div class="ticket">
    ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" class="event-banner" />` : ''}
    <div class="ticket-header">
      <div class="brand"><span class="brand-dot"></span> CodeTickets</div>
      <div class="date-time">
        ${eventDateStr}
        <span class="time">${eventTimeStr}</span>
      </div>
    </div>
    <div class="event-title">${event.title}</div>
    <div class="meta-row">
      <div class="meta-block">
        <span class="label">TICKET</span>
        <span class="value tier">${ticket.order.tier.name}</span>
      </div>
      <div class="meta-block">
        <span class="label">ATTENDEE</span>
        <span class="value">${ticket.attendeeName}</span>
      </div>
    </div>
    <div class="event-details">
      ${event.venue ? `<div class="venue">📍 ${event.venue}${event.address ? ', ' + event.address : ''}${event.city ? ', ' + event.city : ''}</div>` : ''}
    </div>
    <div class="ticket-body">
      <div class="qr-section">
        <img src="${ticket.qrCode}" alt="QR Code" />
        <div class="ticket-id">${ticket.ticketId}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Ticket image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket image' },
      { status: 500 }
    );
  }
}
