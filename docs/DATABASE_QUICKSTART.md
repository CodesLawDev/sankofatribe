# Quick Start: Database Setup Guide

## Step 1: Choose Your Database

### Option A: PostgreSQL Local (Development)
```bash
# On Windows with PostgreSQL installed
# 1. Start PostgreSQL service
# 2. Create database:
createdb sankofatribe

# Connection string:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sankofatribe"
```

### Option B: Supabase (Recommended - Cloud)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Project Settings → Database
4. Format: `postgresql://[user]:[password]@[host]:5432/postgres`

### Option C: Railway (Quick Setup)
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the database connection string

## Step 2: Update Environment Variables

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/sankofatribe"
```

## Step 3: Install Dependencies

```bash
npm install
```

This installs:
- `@prisma/client` - Database client
- `bcryptjs` - Password hashing
- `prisma` - ORM and migration tools
- `ts-node` - TypeScript execution (for seeds)

## Step 4: Run Migrations

```bash
# Create tables based on schema
npm run prisma:migrate

# During migration, give it a name like "init"
```

This creates all tables:
- `User` (unified admin + customer users)
- `Address` (shipping addresses)
- `Order` (customer orders)
- `OrderItem` (order line items)
- `WishlistItem` (account-based wishlists)
- `LoginHistory` (security audit trail)

## Step 5: (Optional) Seed Admin User

```bash
npm run prisma:seed
```

This creates:
- Email: `admin@sankofatribe.com`
- Password: `AdminPassword123!` (⚠️ Change this immediately!)
- Role: ADMIN
- Permissions: Full access

Change the password in `prisma/seed.ts` before running!

## Step 6: Test the Setup

### Register a new customer
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePassword123!"
  }'
```

Response includes auth cookie automatically.

### Check current user
```bash
curl http://localhost:3000/api/auth/me
```

## Step 7: View Database (Optional)

```bash
# Opens Prisma Studio - visual database viewer
npm run prisma:studio
```

Then visit: http://localhost:5555

## Troubleshooting

### "Can't reach database server"
- Verify PostgreSQL is running
- Check DATABASE_URL connection string
- Test connection: `psql <YOUR_CONNECTION_STRING>`

### "Migration failed"
- Existing tables? Run: `npx prisma migrate resolve --applied init`
- Wrong schema? Delete database and start over
- Still stuck? Check Prisma docs: [prisma.io/docs](https://prisma.io/docs)

### "Auth token not working"
- Clear cookies in browser
- Ensure DATABASE_URL is set
- Check server logs for errors

## What's Next

1. **Admin Dashboard Updates**
   - `/admin/customers` → Show Postgres users (role: CUSTOMER)
   - `/admin/users` → Show Postgres users (role: ADMIN)
   - Update to query `prisma.user.findMany()` instead of Sanity

2. **Customer Features**
   - Create `/account` page for customer profiles
   - Implement wishlist (fetches from `WishlistItem` table)
   - Add address management
   - Show order history

3. **API Endpoints** (Already have auth, need these):
   - `GET /api/customers` - List customers
   - `POST /api/customers` - Create customer
   - `GET /api/customers/[id]` - Get customer details
   - `PUT /api/customers/[id]` - Update customer
   - `POST /api/customers/[id]/addresses` - Add address
   - `GET /api/customers/[id]/wishlist` - Get wishlist

4. **Remove from Sanity**
   - Delete `user` schema (was admin users)
   - Keep `customer` schema as read-only reference only

## Architecture Summary

```
┌─────────────────────────────────────┐
│        Next.js App (Frontend)       │
├─────────────────────────────────────┤
│   API Routes (/api/auth/*, etc)    │
│   Components & Pages                │
├─────────────────────────────────────┤
│     lib/auth-utils.ts               │
│     (Password hash, JWT tokens)     │
├─────────────────────────────────────┤
│     Prisma ORM                      │
│     (Database queries)              │
├─────────────────────────────────────┤
│    PostgreSQL Database              │
│  (User, Address, Order, etc)        │
└─────────────────────────────────────┘

SEPARATE:
Sanity CMS → Content only
  - Products, Categories
  - Banners, Promotions
  - Blog posts, FAQs
```

## Key Features Implemented

✅ **User Management**
- Register (POST /api/auth/register)
- Login (POST /api/auth/login) with JWT tokens
- Logout (POST /api/auth/logout)
- Check auth (GET /api/auth/me)
- Password hashing with bcryptjs

✅ **Security**
- HTTP-only cookies (XSS protection)
- JWT token verification
- Login history & audit trail
- User status tracking

✅ **Database Relations**
- Users ↔ Addresses (one-to-many)
- Users ↔ Orders (one-to-many)
- Users ↔ WishlistItems (one-to-many)
- Orders ↔ OrderItems (one-to-many)

✅ **Customer Data**
- Loyalty points tracking
- Total spend calculation
- Preference management (email/SMS)
- Last login timestamps

---

**Ready?** Run `npm install` then follow Step 4 above!
