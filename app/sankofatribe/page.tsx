"use client";
import Link from "next/link";

export default function SankofaTribeLanding() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">SANKOFA TRIBE</h1>
        <p className="mt-2 text-sm text-gray-600">Quick links for management and verification</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/studio"
            className="group rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Sanity Studio</span>
              <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Manage content in the embedded Studio.</p>
          </Link>

          <Link
            href="/admin"
            className="group rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Admin</span>
              <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Administrative tools and dashboards.</p>
          </Link>

          <Link
            href="/verify"
            className="group rounded-lg border border-gray-200 bg-gray-50 p-6 transition hover:border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black sm:col-span-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Verify</span>
              <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Public ticket verification and QR scanning.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
