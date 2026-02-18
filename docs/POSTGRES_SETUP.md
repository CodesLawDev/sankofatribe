# Postgres Database Setup - Complete

## Overview
The system has been transitioned from Sanity-based user management to a **Postgres-first architecture with unified user management**. This provides better support for SMS/email marketing, customer data, and administrative features.

## Architecture Changes

### Before
```
❌ Admin users in Sanity
❌ Separate customer schema in Sanity
❌ Customer data scattered (Sanity + browser)
❌ Phone numbers not indexed for marketing
```

### After
```
✅ ALL users in single Postgres table (admin + customers unified)
✅ Single source of truth for customer data
✅ Phone/email indexed for SMS/email marketing
✅ Transaction-safe order processing
✅ GDPR-compliant audit trail
✅ Sanity remains content-only (products, banners, campaigns)
```

## Files Created/Modified

### 1. Database Schema
**File:** `prisma/schema.prisma`
- **User model**: Unified table for admin staff and customers
  - Fields: id, email, phone, firstName, lastName, passwordHash, role, status
  - Relations: addresses, orders, wishlist, login history
  - Enums: UserRole (ADMIN/CUSTOMER), UserStatus (ACTIVE/INACTIVE/SUSPENDED/DELETED)
  
- **Address model**: Shipping/billing addresses
  - Fields: id, userId, label, street, city, region, postalCode, country, isDefault
  
- **Order model**: Order tracking
  - Fields: id, orderNumber, userId, items[], status, paymentStatus, total
  
- **OrderItem model**: Individual order line items
  
- **WishlistItem model**: Account-based wishlist persistence
  - Fields: id, userId, productId (Sanity ref), addedAt
  
- **LoginHistory model**: Audit trail for security
  - Fields: id, userId, ipAddress, userAgent, loginTime, logoutTime

### 2. Environment Configuration
**File:** `.env.local`
- Added: `DATABASE_URL=postgresql://postgres:password@localhost:5432/sankofatribe`
- ⚠️ **ACTION NEEDED**: Update with your actual Postgres connection string

### 3. Authentication Utilities
**File:** `lib/auth-utils.ts` (NEW)
- `hashPassword()`: bcryptjs encryption for security
- `comparePassword()`: Verify password during login
- `createToken()`: Generate JWT tokens (7-day expiration)
- `verifyToken()`: Validate JWT tokens from cookies
- `registerUser()`: Create new customer accounts
- `loginUser()`: Authenticate users with email/password
- Uses Prisma for database operations

### 4. API Routes - Authentication

#### Register (POST `/api/auth/register`)
```json
Request:
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "phone": "+1234567890"
}

Response (201):
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }
}
```

#### Login (POST `/api/auth/login`)
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "user": { ... }
}
```
Sets HTTP-only cookie with JWT token (7-day expiration)

#### Logout (POST `/api/auth/logout`)
Clears auth token cookie

#### Check Auth (GET `/api/auth/me`)
Returns current logged-in user data
Requires valid auth token in cookie

## Next Steps

### 1. Set Up PostgreSQL Database
You have two options:

**Option A: Local Postgres**
```bash
# Install PostgreSQL locally
# Create database: sankofatribe
# Update .env.local with connection string
```

**Option B: Cloud Database (Recommended for Production)**
- Supabase: `postgresql://[user]:[password]@[host].supabase.co:5432/postgres`
- Railway: Get connection string from dashboard
- Render: PostgreSQL as managed service

### 2. Run Prisma Migrations
```bash
# Install dependencies first
npm install

# Run migrations to create tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Optional: Seed with admin user
npx prisma db seed
```

### 3. Migrate Existing Admin Users
You'll need to migrate admin users from Sanity to Postgres:
- Extract admin users from `user` schema in Sanity
- Create admin accounts in Postgres with `role: "ADMIN"`
- Update admin pages to query Postgres instead of Sanity
- Remove `user` schema from Sanity (keep `customer` for reference only)

### 4. Create Remaining API Routes (Coming Next)
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer
- `PUT /api/customers/[id]` - Update customer
- `POST /api/customers/[id]/addresses` - Add address
- `POST /api/customers/[id]/wishlist` - Add to wishlist
- `GET /api/admin/users` - List all users
- `GET /api/admin/customers` - List customers

### 5. Update Admin Pages
Admin pages currently use Sanity. Will need to update to use Postgres:
- `/admin/customers` → Query from `User` table (role: CUSTOMER)
- `/admin/users` → Query from `User` table (role: ADMIN)
- `/admin/dashboard` → Aggregate data from Postgres

### 6. Build Customer Features
- Customer account dashboard
- Account-based wishlist persistence
- Address management
- Order history
- Profile settings

## Security Features Implemented

✅ **Password Security**
- bcryptjs hashing (10 salt rounds)
- Minimum 8 characters required

✅ **Session Management**
- JWT tokens with 7-day expiration
- HTTP-only cookies (prevents XSS)
- Secure flag in production
- SameSite=Lax protection

✅ **Audit Trail**
- LoginHistory table tracks all logins
- Captures IP address and user agent
- Logout timestamps for session tracking

✅ **Data Protection**
- User status field (ACTIVE/INACTIVE/SUSPENDED/DELETED)
- Soft delete support via status
- Updated/created timestamps

## Database Structure Summary

```sql
-- Main users table
CREATE TABLE "User" (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20) UNIQUE,
  firstName     VARCHAR(100) NOT NULL,
  lastName      VARCHAR(100) NOT NULL,
  passwordHash  TEXT NOT NULL,
  role          ENUM('ADMIN', 'CUSTOMER'),
  status        ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'),
  ...
);

-- Supporting tables
Address         -- Shipping/billing addresses
Order           -- Customer orders
OrderItem       -- Line items in orders
WishlistItem    -- Account-based wishlists
LoginHistory    -- Security audit trail
```

## Configuration Checklist

- [ ] PostgreSQL database created
- [ ] DATABASE_URL configured in .env.local
- [ ] `npm install` completed
- [ ] `npx prisma migrate dev --name init` executed
- [ ] Admin users migrated from Sanity to Postgres
- [ ] Admin pages updated to query Postgres
- [ ] User schema removed from Sanity
- [ ] Customer features tested (register, login, profile)
- [ ] Wishlist persistence tested
- [ ] Password reset flow implemented (pending)
- [ ] Email verification implemented (pending)

## Current Status

**Completed:**
✅ Prisma schema created (unified User model)
✅ .env.local configured with DATABASE_URL placeholder
✅ Auth utilities (hash, compare, token generation/verification)
✅ Register API route (/api/auth/register)
✅ Updated Login API route (/api/auth/login) - Postgres-backed
✅ Updated Logout API route (/api/auth/logout)
✅ Me/Auth check endpoint (/api/auth/me)
✅ Package.json updated (moved @prisma/client and bcryptjs to dependencies)

**In Progress:**
⏳ Database setup (awaiting your Postgres connection string)
⏳ Prisma migrations (awaiting database)

**Pending:**
❌ Customer CRUD API endpoints
❌ Admin user management endpoints
❌ Admin pages refactor (Postgres instead of Sanity)
❌ Customer dashboard/account page
❌ Account-based wishlist implementation
❌ Password reset flow
❌ Email verification
❌ Sanity schema cleanup

## Testing the Setup

Once migrations run:

```bash
# Register a new customer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "TestPassword123!",
    "confirmPassword": "TestPassword123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Check current user (with cookie from login)
curl http://localhost:3000/api/auth/me
```

---

**Next Action:** Provide your PostgreSQL connection string or set up a local Postgres database, then run the migrations!
