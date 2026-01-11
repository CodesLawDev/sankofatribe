"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart-context";

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams?.get('reference');
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found');
      return;
    }

    // Check if this reference has already been processed
    const processedKey = `payment_processed_${reference}`;
    const alreadyProcessed = sessionStorage.getItem(processedKey);
    
    if (alreadyProcessed) {
      console.log('Payment already processed, skipping verification');
      setStatus('success');
      setMessage('Payment successful! Your order has been confirmed.');
      setHasProcessed(true);
      setTimeout(() => {
        router.push('/checkout/success');
      }, 2000);
      return;
    }

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/payment/verify?reference=${reference}`);
      const data = await response.json();

      console.log('Payment verification response:', data);
      console.log('Metadata from payment:', data.metadata);

      if (data.success) {
        // Mark this payment as processed to prevent duplicate SMS
        const processedKey = `payment_processed_${reference}`;
        sessionStorage.setItem(processedKey, 'true');
        
        setStatus('success');
        setMessage('Payment successful! Your order has been confirmed.');
        
        // Update order payment status
        if (data.metadata?.orderId) {
          const updateResponse = await fetch('/api/orders/update-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.metadata.orderId,
              paymentData: {
                paymentStatus: 'paid',
                paymentReference: reference,
                paidAt: data.paidAt,
                paymentMethod: data.channel,
              },
            }),
          });

          const updateResult = await updateResponse.json();
          
          // Only send SMS if this is not a duplicate processing
          if (!updateResult.alreadyProcessed) {
            // Send payment confirmation SMS to customer (includes order confirmation)
            try {
              console.log('Attempting to send payment confirmation SMS...');
              console.log('Customer phone:', data.metadata?.customerPhone);
              console.log('Payment channel:', data.channel);
              
              const paymentSmsResponse = await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'payment_confirmation',
                  data: {
                    customerName: data.metadata?.customerName || 'Valued Customer',
                    customerPhone: data.metadata?.customerPhone,
                    orderId: data.metadata?.orderId,
                    amount: data.amount,
                    paymentMethod: data.channel,
                  },
                }),
              });
              
              const paymentSmsResult = await paymentSmsResponse.json();
              console.log('Payment confirmation SMS result:', paymentSmsResult);
            } catch (error) {
              console.error('Failed to send payment confirmation SMS:', error);
            }

            // Send new order alert to admin
            try {
              // Fetch admin phone from CMS settings
              const settingsResponse = await fetch('/api/settings');
              const settingsData = await settingsResponse.json();
              const adminPhone = settingsData?.data?.adminPhone;

              if (adminPhone) {
                await fetch('/api/sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'new_order_alert',
                    data: {
                      adminPhone: adminPhone,
                      orderId: data.metadata.orderId,
                      total: data.amount,
                    },
                  }),
                });
              } else {
                console.warn('Admin phone not configured in CMS settings');
              }
            } catch (error) {
              console.error('Failed to send admin alert SMS:', error);
            }
          } else {
            console.log('Skipping SMS - payment already processed');
          }
        }

        // Clear cart
        clearCart();

        // Redirect to success page after 3 seconds
        setTimeout(() => {
          router.push('/checkout/success');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('An error occurred while verifying your payment.');
    }
  };

  return (
    <main className="min-h-screen pt-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto px-6"
      >
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            <h1 className="text-3xl md:text-4xl font-light mb-4">Verifying Payment</h1>
            <p className="text-lg font-light text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon className="w-20 h-20 mx-auto mb-8 text-green-500" />
            <h1 className="text-3xl md:text-4xl font-light mb-4">Payment Successful!</h1>
            <p className="text-lg font-light text-gray-600 mb-8">
              {message}
            </p>
            <p className="text-sm font-light text-gray-500">
              Redirecting to confirmation page...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircleIcon className="w-20 h-20 mx-auto mb-8 text-red-500" />
            <h1 className="text-3xl md:text-4xl font-light mb-4">Payment Failed</h1>
            <p className="text-lg font-light text-gray-600 mb-8">
              {message}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/checkout')}
                className="px-8 py-4 bg-black text-white font-light uppercase text-sm tracking-wide hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-4 border border-black font-light uppercase text-sm tracking-wide hover:bg-black hover:text-white transition-colors"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <VerifyPaymentContent />
    </Suspense>
  );
}
