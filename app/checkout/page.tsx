"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import CheckoutProgress from "@/components/checkout-progress"

// =============================================================================
// Checkout Page — collects customer info, creates order, redirects to Paystack
// =============================================================================

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, validateCartStock } = useCart()

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    landmark: "",
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [stockErrors, setStockErrors] = useState<string[]>([])
  const [generalError, setGeneralError] = useState("")
  const [paymentProvider, setPaymentProvider] = useState<"paystack" | "hubtel">("paystack")

  // Promo
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    discountAmount: number
    discountType: string
    freeShipping: boolean
  } | null>(null)
  const [promoError, setPromoError] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)

  const discount = appliedPromo?.discountAmount || 0
  const finalTotal = Math.max(0, cartTotal - discount)

  // ---------- Handlers -------------------------------------------------------

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { setPromoError("Enter a promo code"); return }
    setIsValidatingPromo(true)
    setPromoError("")
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode,
          cartTotal,
          products: cart.map((i) => i.id),
          isFirstTimeCustomer: false,
        }),
      })
      const data = await res.json()
      if (data.valid) {
        setAppliedPromo({
          code: data.promoCode,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          freeShipping: data.freeShipping || false,
        })
        setPromoError("")
      } else {
        setPromoError(data.message || "Invalid promo code")
        setAppliedPromo(null)
      }
    } catch {
      setPromoError("Failed to validate promo code")
      setAppliedPromo(null)
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode("")
    setPromoError("")
  }

  // ---------- Submit ---------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setStockErrors([])
    setGeneralError("")

    try {
      // 1. Validate stock client-side
      const stockCheck = await validateCartStock()
      if (!stockCheck.valid) {
        setStockErrors(stockCheck.errors)
        setIsProcessing(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      // 2. Create order (server generates orderId and computes total)
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
          },
          shippingAddress: { city: form.city, landmark: form.landmark },
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
          promoCode: appliedPromo?.code,
          promoDiscount: discount,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        if (orderData.stockErrors?.length) {
          setStockErrors(orderData.stockErrors)
          setIsProcessing(false)
          window.scrollTo({ top: 0, behavior: "smooth" })
          return
        }
        throw new Error(orderData.error || "Failed to create order")
      }

      const orderId = orderData.orderId

      // 3. Initialize payment with selected provider (use server-computed total)
      const payRes = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          amount: orderData.total || finalTotal,
          orderId,
          customerName: `${form.firstName} ${form.lastName}`,
          customerPhone: form.phone,
          provider: paymentProvider,
          items: cart.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      })
      const payData = await payRes.json()

      if (!payRes.ok || !payData.success) {
        throw new Error(payData.error || "Failed to initialize payment")
      }

      // 4. Redirect to hosted checkout (Paystack or Hubtel)
      window.location.href = payData.authorization_url
    } catch (err: any) {
      console.error("[checkout] error:", err)
      setGeneralError(err.message || "Something went wrong. Please try again.")
      setIsProcessing(false)
    }
  }

  // ---------- Empty cart -----------------------------------------------------

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light mb-4">Your cart is empty</h1>
          <Link
            href="/products"
            className="text-sm uppercase tracking-wide hover:opacity-60 transition-opacity"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  // ---------- Render ---------------------------------------------------------

  return (
    <main className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <CheckoutProgress currentStep={2} />
        <h1 className="text-4xl md:text-5xl font-light mb-12">Checkout</h1>

        {/* Stock errors */}
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
              {stockErrors.map((err, i) => (
                <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/cart"
              className="inline-block mt-4 text-sm font-medium text-red-800 dark:text-red-200 hover:underline"
            >
              Update Cart
            </Link>
          </motion.div>
        )}

        {/* General error */}
        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300"
          >
            {generalError}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ---------- Form ------------------------------------------------ */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact */}
            <section>
              <h2 className="text-xl font-light mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                Contact Information
              </h2>
              <div className="space-y-4">
                <Field label="Email *" name="email" type="email" value={form.email} onChange={onChange} required />
                <Field label="Phone *" name="phone" type="tel" value={form.phone} onChange={onChange} required />
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="text-xl font-light mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name *" name="firstName" value={form.firstName} onChange={onChange} required />
                  <Field label="Last Name *" name="lastName" value={form.lastName} onChange={onChange} required />
                </div>
                <Field
                  label="City / Town (Specific Area) *"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="e.g., Accra - East Legon"
                  required
                />
                <Field
                  label="Nearest Landmark *"
                  name="landmark"
                  value={form.landmark}
                  onChange={onChange}
                  placeholder="e.g., Near A&C Mall"
                  required
                />
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-light mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                Payment Method
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentProvider === "paystack"
                      ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="paystack"
                    checked={paymentProvider === "paystack"}
                    onChange={() => setPaymentProvider("paystack")}
                    className="w-4 h-4 accent-black dark:accent-white"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Card / Mobile Money</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pay with Visa, Mastercard, or Mobile Money via Paystack
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentProvider === "hubtel"
                      ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="hubtel"
                    checked={paymentProvider === "hubtel"}
                    onChange={() => setPaymentProvider("hubtel")}
                    className="w-4 h-4 accent-black dark:accent-white"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Mobile Money (Hubtel)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pay with MTN MoMo, Vodafone Cash, or AirtelTigo Money via Hubtel
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-light uppercase text-sm tracking-wide hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing…" : `Pay GH₵${finalTotal.toLocaleString()}`}
            </button>
          </form>

          {/* ---------- Order Summary -------------------------------------- */}
          <div>
            <div className="sticky top-32">
              <h2 className="text-xl font-light mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-6 mb-8">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-900">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-light mb-1">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-light mt-1">
                        GH₵{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
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
                        className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isValidatingPromo ? "…" : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <div>
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

                {/* Totals */}
                <div className="space-y-3 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-light">Subtotal</span>
                    <span className="font-light">GH₵{cartTotal.toLocaleString()}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span className="font-light">Discount ({appliedPromo.code})</span>
                      <span className="font-light">
                        -GH₵{appliedPromo.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="font-light">Shipping</span>
                    <span className="font-light">
                      {appliedPromo?.freeShipping ? (
                        <span className="text-green-600 dark:text-green-400">Free</span>
                      ) : (
                        "Calculated after payment"
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
  )
}

// =============================================================================
// Reusable input field
// =============================================================================

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-light mb-2">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
      />
    </div>
  )
}
