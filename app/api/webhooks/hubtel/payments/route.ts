import { NextRequest, NextResponse } from 'next/server';
import { verifyHubtelPayment } from '@/lib/hubtel';
import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let payload: any;

  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const data = payload.Data || payload.data || {};
  const clientReference = data.ClientReference || data.clientReference;

  if (!clientReference) {
    return NextResponse.json({ error: 'Missing clientReference' }, { status: 400 });
  }

  try {
    const verifyResult = await verifyHubtelPayment(clientReference);
    if (verifyResult.status !== 'SUCCESS') {
      return NextResponse.json({ received: true, status: verifyResult.status });
    }

    // Best-effort update for store orders; event tickets are handled via return URL.
    try {
      assertSanityToken();
      const order = await serverClient.getDocument(clientReference);

      if (order && order._type === 'order' && order.items) {
        await serverClient
          .patch(clientReference)
          .set({
            paymentStatus: 'paid',
            status: 'processing',
            'metadata.paymentMethod': 'HUBTEL',
            'metadata.paidAt': verifyResult.paidAt ? verifyResult.paidAt.toISOString() : new Date().toISOString(),
          })
          .commit();

        await decrementStock(
          order.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
          }))
        );
      }
    } catch (error) {
      console.warn('[Hubtel Webhook] Failed to update order:', error);
    }
  } catch (error) {
    console.warn('[Hubtel Webhook] Verification failed:', error);
  }

  return NextResponse.json({ received: true });
}
