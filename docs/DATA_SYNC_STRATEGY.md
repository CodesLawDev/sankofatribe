# Data Sync Strategy

SankofaTribe uses a **dual-data-store** architecture:

| Store | Used For |
|-------|----------|
| **Sanity CMS** | Products, categories, banners, orders, payments, promo codes, events, site settings, CMS content pages |
| **PostgreSQL (Prisma)** | Users/auth, ticket orders, event tickets, analytics (page views), newsletter subscribers, login history, addresses, wishlist |

## Why Two Stores?

- **Sanity** powers the storefront content that needs a visual editing experience (products, banners, pages) and the order/payment records that admins review in Sanity Studio.
- **PostgreSQL** handles relational data (users, tickets with unique constraints, analytics aggregation) where referential integrity and SQL queries are essential.

## Data Flow

```
Customer checkout
  → POST /api/orders/create (creates order doc in Sanity)
  → Redirect to Paystack / Hubtel hosted checkout
  → Webhook / verify callback
    → lib/fulfillOrder.ts
      → Create payment record (Sanity)
      → Patch order status (Sanity)
      → Decrement product stock (Sanity, atomic transaction)
      → Increment promo code usage (Sanity)
      → Send SMS (BMS API via /api/sms)
```

```
Event ticket purchase
  → POST /api/events/purchase (creates EventTicketOrder in Postgres)
  → Payment callback
    → fulfillTicketOrder (in payment-callback route)
      → Generate EventTicket rows (Postgres)
      → Update tier sold count (Postgres)
      → SMS with QR code
```

## Overlap Points

| Data | Sanity | Postgres | Source of Truth |
|------|--------|----------|----------------|
| Product catalog | ✅ | ❌ | Sanity |
| Orders (products) | ✅ | ✅ (Order model) | Sanity — Postgres Order is used for user-order history queries |
| Event tickets | ❌ | ✅ | Postgres |
| Event metadata | ✅ (event schema) | ✅ (EventRecord) | Sanity — EventRecord is a sync mirror |
| Newsletter | ✅ (newsletterSubscriber) | ✅ (NewsletterSubscriber) | Postgres — Sanity copy is best-effort |
| Users / Auth | ✅ (user, customer) | ✅ (User) | Postgres — Sanity user/customer schemas are legacy |

## Sync Rules

1. **Products**: Sanity is the single source of truth. No sync needed.
2. **Orders**: Created in Sanity. Postgres `Order` model exists for relational queries (user → orders). If used, keep both in sync during order creation.
3. **Events**: Sanity `event` schema is edited by admins. The Prisma `EventRecord` is a mirror populated by a sync script (`scripts/sync-events.ts`) or webhook.
4. **Newsletter**: Primary store is Postgres. A best-effort copy is made to Sanity during subscription. If one fails, the other still works.
5. **Users**: Postgres is the auth source of truth. The Sanity `user` and `customer` schemas are legacy/informational.

## Recommended Improvements

- Add a Sanity webhook listener (`/api/webhooks/sanity`) that syncs event changes to `EventRecord`.
- Remove unused Sanity `user` / `customer` schemas once admin tooling is confirmed to not depend on them.
- Consider moving orders fully to Postgres for better relational queries, keeping Sanity as a read-only mirror for Studio display.

## Environment Variables Involved

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string for Prisma |
| `SANITY_WRITE_TOKEN` | Sanity mutations (server-side only) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name |
| `INTERNAL_API_SECRET` | Shared secret for server-to-server calls (SMS, settings) |
