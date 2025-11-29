import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

const notConfigured = (method: string) => {
    throw new Error(
        `[stripe] ${method} requires STRIPE_SECRET_KEY. Set STRIPE_SECRET_KEY in .env.local to use Stripe.`
    )
}

// Provide a safe fallback during local dev so the app can boot
// without Stripe configured. Any actual Stripe usage will still
// throw with a clear message.
export const stripe: Stripe = key
    ? new Stripe(key, { apiVersion: '2023-10-16' })
    : ({
          checkout: {
              sessions: {
                  create: async () => notConfigured('checkout.sessions.create'),
              },
          },
          webhooks: {
              constructEvent: () => notConfigured('webhooks.constructEvent'),
          },
      } as unknown as Stripe)

if (!key) {
    console.warn('[stripe] STRIPE_SECRET_KEY is not set. Using mock for local dev.\nRoutes that call Stripe will throw until you set STRIPE_SECRET_KEY.')
}
