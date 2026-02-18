"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { useCart } from "@/lib/cart-context"

// =============================================================================
// /checkout/verify — Paystack redirects here with ?reference=xxx
// The page calls the server-side verify API which handles everything:
//   order update, stock decrement, SMS, payment record.
// Client only shows status and clears the cart on success.
// =============================================================================

function VerifyPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams?.get("reference")
  const { clearCart } = useCart()

  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying")
  const [message, setMessage] = useState("Verifying your payment…")

  useEffect(() => {
    if (!reference) {
      setStatus("failed")
      setMessage("No payment reference found.")
      return
    }

    // Prevent duplicate verification on React strict-mode double-mount
    const key = `payment_verified_${reference}`
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) {
      setStatus("success")
      setMessage("Payment already verified!")
      clearCart()
      setTimeout(() => router.push("/checkout/success"), 2000)
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/payment/verify?reference=${reference}`)
        const data = await res.json()

        if (data.success) {
          sessionStorage.setItem(key, "1")
          setStatus("success")
          setMessage("Payment successful! Redirecting…")
          clearCart()
          setTimeout(() => router.push("/checkout/success"), 3000)
        } else {
          setStatus("failed")
          setMessage(data.error || "Payment verification failed.")
        }
      } catch {
        setStatus("failed")
        setMessage("An error occurred while verifying your payment.")
      }
    }

    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference])

  return (
    <main className="min-h-screen pt-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto px-6"
      >
        {status === "verifying" && (
          <>
            <div className="w-20 h-20 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto mb-8" />
            <h1 className="text-3xl md:text-4xl font-light mb-4">Verifying Payment</h1>
            <p className="text-lg font-light text-gray-600 dark:text-gray-400">
              Please wait while we confirm your payment…
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon className="w-20 h-20 mx-auto mb-8 text-green-500" />
            <h1 className="text-3xl md:text-4xl font-light mb-4">Payment Successful!</h1>
            <p className="text-lg font-light text-gray-600 dark:text-gray-400 mb-8">
              {message}
            </p>
            <p className="text-sm font-light text-gray-500">Redirecting to confirmation page…</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircleIcon className="w-20 h-20 mx-auto mb-8 text-red-500" />
            <h1 className="text-3xl md:text-4xl font-light mb-4">Payment Failed</h1>
            <p className="text-lg font-light text-gray-600 dark:text-gray-400 mb-8">{message}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/checkout")}
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-light uppercase text-sm tracking-wide hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-8 py-4 border border-black dark:border-white font-light uppercase text-sm tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </motion.div>
    </main>
  )
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading…</p>
          </div>
        </main>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  )
}
