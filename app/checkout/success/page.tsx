"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

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
        <h1 className="text-4xl md:text-5xl font-light mb-6">Order Placed Successfully!</h1>
        <p className="text-lg font-light text-gray-600 mb-8">
          Thank you for your order. We&apos;ve sent a confirmation email with your order details.
        </p>
        <p className="text-sm font-light text-gray-600 mb-12">
          You&apos;ll receive another email when your order ships.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="px-8 py-4 bg-black text-white font-light uppercase text-sm tracking-wide hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="px-8 py-4 border border-black font-light uppercase text-sm tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
