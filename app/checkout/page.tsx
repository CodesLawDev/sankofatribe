"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const { cart, cartTotal, clearCart, validateCartStock } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    city: "",
    landmark: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    freeShipping: boolean;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Calculate final total with promo discount
  const discount = appliedPromo?.discountAmount || 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsValidatingPromo(true);
    setPromoError("");

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          cartTotal,
          products: cart.map(item => item.id),
          isFirstTimeCustomer: false, // Could be determined by checking order history
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedPromo({
          code: data.promoCode,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          freeShipping: data.freeShipping || false,
        });
        setPromoError("");
      } else {
        setPromoError(data.message || "Invalid promo code");
        setAppliedPromo(null);
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoError("Failed to validate promo code");
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStockErrors([]);

    try {
      // Validate stock before proceeding
      const stockValidation = await validateCartStock();
      
      if (!stockValidation.valid) {
        setStockErrors(stockValidation.errors);
        setIsProcessing(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Generate order ID
      const orderId = `ORD-${Date.now()}`;

      // Create order in Sanity
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderDate: new Date().toISOString(),
          status: 'pending_payment',
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            city: formData.city,
            landmark: formData.landmark,
          },
          items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
          subtotal: cartTotal,
          discount: discount,
          promoCode: appliedPromo?.code,
          shippingCost: 0,
          tax: 0,
          total: finalTotal,
          paymentStatus: 'pending',
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        
        // Check if it's a stock validation error
        if (errorData.stockErrors && Array.isArray(errorData.stockErrors)) {
          setStockErrors(errorData.stockErrors);
          setIsProcessing(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to create order');
      }

      // Initialize payment with the final total after discount
      const paymentResponse = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: finalTotal,
          orderId,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: formData.phone,
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        console.error('Payment initialization failed:', paymentData);
        throw new Error(paymentData.error || paymentData.message || 'Failed to initialize payment');
      }

      // Increment promo code usage if applied
      if (appliedPromo) {
        await fetch('/api/promo/validate', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedPromo.code }),
        });
      }

      // Redirect to payment page (SMS will be sent after successful payment)
      window.location.href = paymentData.authorization_url;
    } catch (error) {
      console.error('Order processing error:', error);
      alert('There was an error processing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light mb-4">Your cart is empty</h1>
          <Link href="/products" className="text-sm uppercase tracking-wide hover:opacity-60 transition-opacity">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h1 className="text-4xl md:text-5xl font-light mb-12">Checkout</h1>

        {/* Stock Error Notification */}
        {stockErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-3">
              Stock Availability Issues
            </h3>
            <ul className="space-y-2">
              {stockErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-red-800 dark:text-red-200">
              Please update your cart quantities before proceeding with checkout.
            </p>
            <Link 
              href="/products" 
              className="inline-block mt-4 text-sm font-medium text-red-800 dark:text-red-200 hover:underline"
            >
              Return to Shopping
            </Link>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-light mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-light mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-light mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h2 className="text-xl font-light mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-light mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-light mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-light mb-2">
                      City/Town (Specific Area) *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Accra - East Legon"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="landmark" className="block text-sm font-light mb-2">
                      Nearest Landmark *
                    </label>
                    <input
                      type="text"
                      id="landmark"
                      name="landmark"
                      required
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g., Near A&C Mall"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-light uppercase text-sm tracking-wide hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-32">
              <h2 className="text-xl font-light mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                Order Summary
              </h2>
              <div className="space-y-6 mb-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-900">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-light mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-light mt-1">
                        GH₵{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
                {/* Promo Code Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-light uppercase tracking-wide">Promo Code</h3>
                  
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isValidatingPromo || !promoCode.trim()}
                        className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isValidatingPromo ? "Validating..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          {appliedPromo.code} applied
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          -GH₵{appliedPromo.discountAmount.toLocaleString()} discount
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-xs text-green-800 dark:text-green-200 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  {promoError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{promoError}</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-3 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-light">Subtotal</span>
                    <span className="font-light">GH₵{cartTotal.toLocaleString()}</span>
                  </div>
                  
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span className="font-light">Discount ({appliedPromo.code})</span>
                      <span className="font-light">-GH₵{appliedPromo.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="font-light">Shipping</span>
                    <span className="font-light">
                      {appliedPromo?.freeShipping ? (
                        <span className="text-green-600 dark:text-green-400">Free</span>
                      ) : (
                        "Calculated at next step"
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg pt-3 border-t border-gray-200 dark:border-gray-800">
                    <span className="font-light">Total</span>
                    <span className="font-medium">GH₵{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
