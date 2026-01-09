// Stripe removed from project - using mock implementation for compatibility
// If you need Stripe, install it with: npm install stripe

const notConfigured = (method: string) => {
    throw new Error(
        `Stripe is not configured. Install stripe and set STRIPE_SECRET_KEY in .env to use Stripe.`
    )
}

// Mock Stripe object for local development
export const stripe = {
    checkout: {
        sessions: {
            create: async () => notConfigured('checkout.sessions.create'),
        },
    },
    webhooks: {
        constructEvent: (body: any, sig: string, secret: string) => notConfigured('webhooks.constructEvent'),
    },
}

console.warn('Using mock Stripe implementation. Install stripe package if you need real Stripe functionality.')
