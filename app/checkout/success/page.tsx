"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircleIcon } from "@heroicons/react/24/outline"

export default function CheckoutSuccess() {
  return (
    <main className="min-h-screen pt-24 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto px-6"
      >
        <CheckCircleIcon className="w-20 h-20 mx-auto mb-8 text-green-500" />
        <h1 className="text-4xl md:text-5xl font-light mb-6">
          Order Placed Successfully!
        </h1>
        <p className="text-lg font-light text-gray-600 dark:text-gray-400 mb-4">
          Thank you for your order. You will receive an SMS confirmation with your order details shortly.
        </p>
        <p className="text-sm font-light text-gray-500 dark:text-gray-500 mb-12">
          We&apos;ll notify you when your order is ready for delivery.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-light uppercase text-sm tracking-wide hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="px-8 py-4 border border-black dark:border-white font-light uppercase text-sm tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
